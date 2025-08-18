const db = require('../db/connection');

class Meeting {
  static async create(meetingData) {
    const { 
      user_id, 
      title, 
      description, 
      agenda, 
      participants, 
      meeting_date, 
      duration 
    } = meetingData;
    
    const query = `
      INSERT INTO meetings (user_id, title, description, agenda, participants, meeting_date, duration)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      user_id, 
      title, 
      description, 
      agenda, 
      JSON.stringify(participants), 
      meeting_date, 
      duration
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM meetings WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rows[0]) {
      const meeting = result.rows[0];
      meeting.participants = JSON.parse(meeting.participants || '[]');
      meeting.ai_assistance = JSON.parse(meeting.ai_assistance || '{}');
      return meeting;
    }
    
    return null;
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM meetings WHERE user_id = $1 ORDER BY meeting_date DESC';
    const result = await db.query(query, [userId]);
    
    return result.rows.map(meeting => ({
      ...meeting,
      participants: JSON.parse(meeting.participants || '[]'),
      ai_assistance: JSON.parse(meeting.ai_assistance || '{}')
    }));
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'participants' || key === 'ai_assistance') {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(updates[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE meetings 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    
    if (result.rows[0]) {
      const meeting = result.rows[0];
      meeting.participants = JSON.parse(meeting.participants || '[]');
      meeting.ai_assistance = JSON.parse(meeting.ai_assistance || '{}');
      return meeting;
    }
    
    return null;
  }

  static async delete(id) {
    const query = 'DELETE FROM meetings WHERE id = $1';
    await db.query(query, [id]);
    return { success: true };
  }

  static async findUpcoming(userId) {
    const query = `
      SELECT * FROM meetings 
      WHERE user_id = $1 AND meeting_date > CURRENT_TIMESTAMP 
      ORDER BY meeting_date ASC
    `;
    const result = await db.query(query, [userId]);
    
    return result.rows.map(meeting => ({
      ...meeting,
      participants: JSON.parse(meeting.participants || '[]'),
      ai_assistance: JSON.parse(meeting.ai_assistance || '{}')
    }));
  }
}

module.exports = Meeting;
