const db = require('../db/connection');

class Idea {
  static async create(ideaData) {
    const { 
      user_id, 
      title, 
      description, 
      target_audience, 
      problem_statement, 
      solution, 
      market_size 
    } = ideaData;
    
    const query = `
      INSERT INTO ideas (user_id, title, description, target_audience, problem_statement, solution, market_size)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      user_id, 
      title, 
      description, 
      target_audience, 
      problem_statement, 
      solution, 
      market_size
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM ideas WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM ideas WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE ideas 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM ideas WHERE id = $1';
    await db.query(query, [id]);
    return { success: true };
  }

  static async findByValidationStatus(userId, status) {
    const query = 'SELECT * FROM ideas WHERE user_id = $1 AND validation_status = $2 ORDER BY created_at DESC';
    const result = await db.query(query, [userId, status]);
    return result.rows;
  }

  static async updateValidationStatus(id, status, validationData = {}) {
    const query = `
      UPDATE ideas 
      SET validation_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }
}

module.exports = Idea;
