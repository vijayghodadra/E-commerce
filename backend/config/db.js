const { Pool } = require('pg');
const crypto = require('crypto');

let pool = null;

// Generate 24-character hex ID (like MongoDB ObjectId)
function generateObjectId() {
  return crypto.randomBytes(12).toString('hex');
}

const connectDB = async () => {
  try {
    const isServerless = !!process.env.VERCEL;
    connectDB.connectionError = null;

    console.error('Diagnostics:', {
      VERCEL: process.env.VERCEL,
      NODE_ENV: process.env.NODE_ENV,
      isServerless,
      connType: typeof process.env.SUPABASE_CONNECTION_STRING,
      connLength: process.env.SUPABASE_CONNECTION_STRING ? process.env.SUPABASE_CONNECTION_STRING.length : 0,
      connMasked: process.env.SUPABASE_CONNECTION_STRING ? process.env.SUPABASE_CONNECTION_STRING.substring(0, 15) + '...' : 'undefined'
    });

    if (!process.env.SUPABASE_CONNECTION_STRING) {
      const errorMsg = 'SUPABASE_CONNECTION_STRING environment variable is missing';
      console.error(errorMsg);
      connectDB.connectionError = errorMsg;
      return;
    }

    pool = new Pool({
      connectionString: process.env.SUPABASE_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false },
      max: isServerless ? 2 : 10,
      idleTimeoutMillis: 5000,
      connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client:', err.message);
    });

    if (isServerless) {
      console.error('Supabase pool initialized lazily for serverless environment');
      return;
    }

    const client = await pool.connect();
    console.error('Supabase PostgreSQL Connected successfully');
    client.release();

    await initializeTables();
  } catch (error) {
    console.error(`PostgreSQL Connection Error: ${error.message}`);
    connectDB.connectionError = error.message;
  }
};

const initializeTables = async () => {
  const tables = [
    'users',
    'categories',
    'products',
    'addresses',
    'carts',
    'wishlists',
    'coupons',
    'orders'
  ];

  for (const table of tables) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${table} (
        _id VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  }
  console.log('Database tables initialized successfully');
};

const TABLE_DEFAULTS = {
  users: {
    role: 'customer',
    phone: '',
    isBlocked: false
  },
  products: {
    brand: 'Pure Botanical',
    rating: 0.0,
    numReviews: 0,
    images: [],
    stockStatus: 'in_stock',
    isActive: true,
    reviews: []
  },
  categories: {
    image: '',
    description: ''
  },
  addresses: {
    country: 'India',
    isDefault: false
  },
  carts: {
    items: []
  },
  wishlists: {
    products: []
  },
  coupons: {
    discountType: 'percentage',
    minPurchase: 0.0,
    maxDiscount: 0.0,
    isActive: true
  },
  orders: {
    paymentMethod: 'COD',
    itemsPrice: 0.0,
    taxPrice: 0.0,
    shippingPrice: 0.0,
    discountPrice: 0.0,
    totalPrice: 0.0,
    isPaid: false,
    orderStatus: 'Pending'
  }
};

function applyUpdate(doc, update) {
  let setObj = update;
  if (update.$set) {
    setObj = update.$set;
  }
  
  const cleanDoc = { ...doc };
  delete cleanDoc._tableName;
  
  for (const [k, v] of Object.entries(setObj)) {
    cleanDoc[k] = v;
  }
  return cleanDoc;
}

class DocumentInstance {
  constructor(tableName, data) {
    Object.defineProperty(this, '_tableName', {
      value: tableName,
      enumerable: false,
      writable: true,
      configurable: true
    });
    this._id = data._id || generateObjectId();
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();

    const defaults = TABLE_DEFAULTS[tableName] || {};
    const merged = { ...defaults, ...data };

    for (const [k, v] of Object.entries(merged)) {
      if (k !== '_tableName') {
        this[k] = v;
      }
    }
  }

  async save() {
    const dataToSave = { ...this };
    delete dataToSave._tableName;
    delete dataToSave._id;
    delete dataToSave.createdAt;
    delete dataToSave.updatedAt;

    const { rows } = await pool.query(`SELECT 1 FROM ${this._tableName} WHERE _id = $1`, [this._id]);
    
    if (rows.length > 0) {
      this.updatedAt = new Date();
      await pool.query(
        `UPDATE ${this._tableName} SET data = $1, updated_at = NOW() WHERE _id = $2`,
        [JSON.stringify(dataToSave), this._id]
      );
    } else {
      await pool.query(
        `INSERT INTO ${this._tableName} (_id, data, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())`,
        [this._id, JSON.stringify(dataToSave)]
      );
    }
    return this;
  }

  async populate(field, selectFields) {
    let path = field;
    let select = selectFields;
    if (typeof field === 'object' && field !== null) {
      path = field.path;
      select = field.select || selectFields;
    }

    let paths = typeof path === 'string' ? [path] : path;

    for (const p of paths) {
      if (p === 'items.product') {
        if (Array.isArray(this.items)) {
          for (const item of this.items) {
            if (item.product) {
              const idVal = typeof item.product === 'object' && item.product._id ? item.product._id : item.product;
              const { rows: refRows } = await pool.query(`SELECT * FROM products WHERE _id = $1`, [idVal]);
              if (refRows.length > 0) {
                item.product = { _id: refRows[0]._id, ...refRows[0].data };
              }
            }
          }
        }
        continue;
      }

      if (p === 'orderItems.product') {
        if (Array.isArray(this.orderItems)) {
          for (const item of this.orderItems) {
            if (item.product) {
              const idVal = typeof item.product === 'object' && item.product._id ? item.product._id : item.product;
              const { rows: refRows } = await pool.query(`SELECT * FROM products WHERE _id = $1`, [idVal]);
              if (refRows.length > 0) {
                item.product = { _id: refRows[0]._id, ...refRows[0].data };
              }
            }
          }
        }
        continue;
      }

      const refId = this[p];
      if (refId) {
        let refTable;
        if (p === 'category') refTable = 'categories';
        else if (p === 'user') refTable = 'users';
        else if (p === 'products') refTable = 'products';
        else refTable = `${p}s`;

        if (Array.isArray(refId)) {
          const populatedList = [];
          for (const singleId of refId) {
            const idVal = typeof singleId === 'object' && singleId._id ? singleId._id : singleId;
            const { rows: refRows } = await pool.query(`SELECT * FROM ${refTable} WHERE _id = $1`, [idVal]);
            if (refRows.length > 0) {
              populatedList.push({ _id: refRows[0]._id, ...refRows[0].data });
            }
          }
          this[p] = populatedList;
        } else {
          const idVal = typeof refId === 'object' && refId._id ? refId._id : refId;
          const { rows: refRows } = await pool.query(`SELECT * FROM ${refTable} WHERE _id = $1`, [idVal]);
          if (refRows.length > 0) {
            this[p] = { _id: refRows[0]._id, ...refRows[0].data };
          }
        }
      }
    }
    return this;
  }
}

class QueryChain {
  constructor(tableName, queryPromise, single = false, modelClass = null) {
    this.tableName = tableName;
    this.queryPromise = queryPromise;
    this.single = single;
    this.modelClass = modelClass;
    this.sortOption = null;
    this.limitOption = null;
    this.skipOption = null;
    this.populateOptions = [];
    this.selectOptions = null;
  }

  sort(sortObj) {
    this.sortOption = sortObj;
    return this;
  }

  limit(limitVal) {
    this.limitOption = limitVal;
    return this;
  }

  skip(skipVal) {
    this.skipOption = skipVal;
    return this;
  }

  populate(field, selectFields) {
    if (typeof field === 'object' && field !== null) {
      this.populateOptions.push({
        field: field.path,
        selectFields: field.select || selectFields
      });
    } else {
      this.populateOptions.push({ field, selectFields });
    }
    return this;
  }

  select(selectFields) {
    this.selectOptions = selectFields;
    return this;
  }

  async then(resolve, reject) {
    try {
      const result = await this.execute();
      if (resolve) resolve(result);
      return result;
    } catch (err) {
      if (reject) reject(err);
      throw err;
    }
  }

  async execute() {
    if (!pool) throw new Error('Database pool not connected');
    let { sql, values } = await this.queryPromise;

    if (this.sortOption) {
      const sortParts = [];
      const sortObj = typeof this.sortOption === 'string' ? { [this.sortOption]: 1 } : this.sortOption;
      for (const [key, direction] of Object.entries(sortObj)) {
        const dir = direction === 1 || direction === 'asc' || direction === 'ascending' ? 'ASC' : 'DESC';
        if (key === 'createdAt') {
          sortParts.push(`created_at ${dir}`);
        } else if (key === 'price' || key === 'rating') {
          sortParts.push(`(data->>'${key}')::numeric ${dir}`);
        } else {
          sortParts.push(`data->>'${key}' ${dir}`);
        }
      }
      if (sortParts.length > 0) {
        sql += ` ORDER BY ${sortParts.join(', ')}`;
      }
    }

    if (this.limitOption !== null) {
      sql += ` LIMIT ${Number(this.limitOption)}`;
    }

    if (this.skipOption !== null) {
      sql += ` OFFSET ${Number(this.skipOption)}`;
    }

    const { rows } = await pool.query(sql, values);
    let docs = rows.map(r => {
      const docData = {
        _id: r._id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        ...r.data
      };

      if (this.tableName === 'users') {
        const selectStr = typeof this.selectOptions === 'string' ? this.selectOptions : '';
        if (!selectStr.includes('+password')) {
          delete docData.password;
        }
      }

      return this.modelClass ? new this.modelClass(this.tableName, docData) : docData;
    });

    for (const pop of this.populateOptions) {
      let fields = pop.field;
      if (typeof fields === 'string') {
        fields = [fields];
      }
      for (const field of fields) {
        for (const doc of docs) {
          if (field === 'items.product') {
            if (Array.isArray(doc.items)) {
              for (const item of doc.items) {
                if (item.product) {
                  const idVal = typeof item.product === 'object' && item.product._id ? item.product._id : item.product;
                  const { rows: refRows } = await pool.query(`SELECT * FROM products WHERE _id = $1`, [idVal]);
                  if (refRows.length > 0) {
                    item.product = { _id: refRows[0]._id, ...refRows[0].data };
                  }
                }
              }
            }
            continue;
          }

          if (field === 'orderItems.product') {
            if (Array.isArray(doc.orderItems)) {
              for (const item of doc.orderItems) {
                if (item.product) {
                  const idVal = typeof item.product === 'object' && item.product._id ? item.product._id : item.product;
                  const { rows: refRows } = await pool.query(`SELECT * FROM products WHERE _id = $1`, [idVal]);
                  if (refRows.length > 0) {
                    item.product = { _id: refRows[0]._id, ...refRows[0].data };
                  }
                }
              }
            }
            continue;
          }

          const refId = doc[field];
          if (refId) {
            let refTable;
            if (field === 'category') refTable = 'categories';
            else if (field === 'user') refTable = 'users';
            else if (field === 'products') refTable = 'products';
            else refTable = `${field}s`;

            if (Array.isArray(refId)) {
              const populatedList = [];
              for (const singleId of refId) {
                const idVal = typeof singleId === 'object' && singleId._id ? singleId._id : singleId;
                const { rows: refRows } = await pool.query(`SELECT * FROM ${refTable} WHERE _id = $1`, [idVal]);
                if (refRows.length > 0) {
                  populatedList.push({ _id: refRows[0]._id, ...refRows[0].data });
                }
              }
              doc[field] = populatedList;
            } else {
              const idVal = typeof refId === 'object' && refId._id ? refId._id : refId;
              const { rows: refRows } = await pool.query(`SELECT * FROM ${refTable} WHERE _id = $1`, [idVal]);
              if (refRows.length > 0) {
                doc[field] = { _id: refRows[0]._id, ...refRows[0].data };
              }
            }
          }
        }
      }
    }

    if (this.single) {
      return docs.length > 0 ? docs[0] : null;
    }
    return docs;
  }
}

class SupabaseModel {
  constructor(tableName, modelClass) {
    this.tableName = tableName;
    this.modelClass = modelClass;
  }

  compileQuery(query) {
    const clauses = [];
    const values = [];
    let index = 1;

    for (const [key, val] of Object.entries(query || {})) {
      if (key === '_id') {
        clauses.push(`_id = $${index}`);
        values.push(val);
        index++;
      } else if (val && typeof val === 'object' && !Array.isArray(val)) {
        if ('$regex' in val) {
          const option = val.$options || '';
          const op = option.includes('i') ? 'ILIKE' : 'LIKE';
          clauses.push(`data->>'${key}' ${op} $${index}`);
          let pattern = val.$regex;
          pattern = pattern.replace(/^\^|\$$/g, '');
          values.push(`%${pattern}%`);
          index++;
        }
        if ('$gte' in val) {
          clauses.push(`(data->>'${key}')::numeric >= $${index}`);
          values.push(Number(val.$gte));
          index++;
        }
        if ('$lte' in val) {
          clauses.push(`(data->>'${key}')::numeric <= $${index}`);
          values.push(Number(val.$lte));
          index++;
        }
      } else {
        if (typeof val === 'boolean') {
          clauses.push(`(data->>'${key}')::boolean = $${index}`);
          values.push(val);
        } else if (typeof val === 'number') {
          clauses.push(`(data->>'${key}')::numeric = $${index}`);
          values.push(val);
        } else {
          clauses.push(`data->>'${key}' = $${index}`);
          values.push(val === null ? null : String(val));
        }
        index++;
      }
    }

    const whereClause = clauses.length > 0 ? 'WHERE ' + clauses.join(' AND ') : '';
    const sql = `SELECT * FROM ${this.tableName} ${whereClause}`;
    return { sql, whereClause, values };
  }

  find(query = {}) {
    const qPromise = Promise.resolve().then(() => this.compileQuery(query));
    return new QueryChain(this.tableName, qPromise, false, this.modelClass);
  }

  findOne(query = {}) {
    const qPromise = Promise.resolve().then(() => this.compileQuery(query));
    return new QueryChain(this.tableName, qPromise, true, this.modelClass);
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const doc = await this.findById(id);
    if (!doc) return null;
    const updatedData = applyUpdate(doc, update);
    const inst = new this.modelClass(this.tableName, updatedData);
    return await inst.save();
  }

  async findOneAndUpdate(query, update, options = {}) {
    const doc = await this.findOne(query);
    if (!doc) return null;
    const updatedData = applyUpdate(doc, update);
    const inst = new this.modelClass(this.tableName, updatedData);
    return await inst.save();
  }

  async findByIdAndDelete(id) {
    const doc = await this.findById(id);
    if (!doc) return null;
    await pool.query(`DELETE FROM ${this.tableName} WHERE _id = $1`, [id]);
    return doc;
  }

  async findOneAndDelete(query) {
    const doc = await this.findOne(query);
    if (!doc) return null;
    await pool.query(`DELETE FROM ${this.tableName} WHERE _id = $1`, [doc._id]);
    return doc;
  }

  async create(data) {
    if (Array.isArray(data)) {
      const created = [];
      for (const item of data) {
        const inst = new this.modelClass(this.tableName, item);
        await inst.save();
        created.push(inst);
      }
      return created;
    }
    const inst = new this.modelClass(this.tableName, data);
    await inst.save();
    return inst;
  }

  async countDocuments(query = {}) {
    const { whereClause, values } = this.compileQuery(query);
    const countSql = `SELECT COUNT(*) FROM ${this.tableName} ${whereClause}`;
    const { rows } = await pool.query(countSql, values);
    return Number(rows[0].count);
  }

  async deleteMany(query = {}) {
    const { whereClause, values } = this.compileQuery(query);
    const deleteSql = `DELETE FROM ${this.tableName} ${whereClause}`;
    const { rowCount } = await pool.query(deleteSql, values);
    return { acknowledged: true, deletedCount: rowCount };
  }

  async updateMany(query, update) {
    const docs = await this.find(query);
    let modifiedCount = 0;
    for (const doc of docs) {
      const updatedData = applyUpdate(doc, update);
      const inst = new this.modelClass(this.tableName, updatedData);
      await inst.save();
      modifiedCount++;
    }
    return { acknowledged: true, modifiedCount };
  }

  async insertMany(arr) {
    return await this.create(arr);
  }

  async aggregate(pipeline) {
    const allDocs = await this.find({});
    let results = [...allDocs];

    for (const stage of pipeline) {
      if (stage.$match) {
        results = results.filter(doc => {
          for (const [key, val] of Object.entries(stage.$match)) {
            if (key === 'createdAt' && val && typeof val === 'object') {
              if (val.$gte) {
                const docDate = new Date(doc.createdAt);
                if (docDate < new Date(val.$gte)) return false;
              }
              if (val.$lte) {
                const docDate = new Date(doc.createdAt);
                if (docDate > new Date(val.$lte)) return false;
              }
            } else {
              if (doc[key] !== val) return false;
            }
          }
          return true;
        });
      } else if (stage.$group) {
        const groupKey = stage.$group._id;
        const groups = {};

        for (const doc of results) {
          let idVal = '';
          if (groupKey && typeof groupKey === 'object' && groupKey.$dateToString) {
            const dateVal = new Date(doc.createdAt);
            const yyyy = dateVal.getFullYear();
            const mm = String(dateVal.getMonth() + 1).padStart(2, '0');
            const dd = String(dateVal.getDate()).padStart(2, '0');
            idVal = `${yyyy}-${mm}-${dd}`;
          } else if (typeof groupKey === 'string' && groupKey.startsWith('$')) {
            const field = groupKey.substring(1);
            idVal = doc[field];
          } else {
            idVal = groupKey;
          }

          if (!groups[idVal]) {
            groups[idVal] = { _id: idVal, count: 0, revenue: 0 };
          }
          groups[idVal].count += 1;
          // Sum isPaid orders price
          const sumField = stage.$group.revenue?.$sum || stage.$group.totalPrice?.$sum || '';
          const sumVal = sumField && sumField.startsWith('$') ? Number(doc[sumField.substring(1)] || 0) : 0;
          groups[idVal].revenue += sumVal;
        }

        results = Object.values(groups);
      } else if (stage.$sort) {
        const sortKey = Object.keys(stage.$sort)[0];
        const direction = stage.$sort[sortKey];
        results.sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return direction === 1 ? -1 : 1;
          if (a[sortKey] > b[sortKey]) return direction === 1 ? 1 : -1;
          return 0;
        });
      }
    }

    return results;
  }
}

connectDB.getPool = () => pool;
connectDB.DocumentInstance = DocumentInstance;
connectDB.SupabaseModel = SupabaseModel;
connectDB.generateObjectId = generateObjectId;

module.exports = connectDB;
