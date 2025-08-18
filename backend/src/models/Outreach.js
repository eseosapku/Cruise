const db = require('../db/connection');

class Outreach {
  static async create(outreachData) {
    const { 
      user_id, 
      campaign_id, 
      profile_id, 
      profile_name, 
      profile_url, 
      message, 
      template_type 
    } = outreachData;
    
    const query = `
      INSERT INTO outreach (user_id, campaign_id, profile_id, profile_name, profile_url, message, template_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      user_id, 
      campaign_id, 
      profile_id, 
      profile_name, 
      profile_url, 
      message, 
      template_type
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM outreach WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM outreach WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async findByCampaignId(campaignId) {
    const query = 'SELECT * FROM outreach WHERE campaign_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [campaignId]);
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
      UPDATE outreach 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async updateStatus(id, status, additionalData = {}) {
    const updates = { status, ...additionalData };
    
    if (status === 'sent') {
      updates.sent_at = new Date();
    } else if (status === 'replied') {
      updates.replied_at = new Date();
    }
    
    return this.update(id, updates);
  }

  static async delete(id) {
    const query = 'DELETE FROM outreach WHERE id = $1';
    await db.query(query, [id]);
    return { success: true };
  }

  static async getStatsByUser(userId) {
    const query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM outreach 
      WHERE user_id = $1 
      GROUP BY status
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  static async getStatsByCampaign(campaignId) {
    const query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM outreach 
      WHERE campaign_id = $1 
      GROUP BY status
    `;
    
    const result = await db.query(query, [campaignId]);
    return result.rows;
  }
}

module.exports = Outreach;
