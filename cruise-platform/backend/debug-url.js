require('dotenv').config();

console.log('Current DATABASE_URL structure:');
const dbUrl = process.env.DATABASE_URL;
console.log('Raw URL:', dbUrl);

if (dbUrl) {
    try {
        const url = new URL(dbUrl);
        console.log('Protocol:', url.protocol);
        console.log('Username:', url.username);
        console.log('Password:', url.password ? '[REDACTED]' : 'NOT SET');
        console.log('Hostname:', url.hostname);
        console.log('Port:', url.port);
        console.log('Database:', url.pathname);
    } catch (error) {
        console.log('URL parsing error:', error.message);
    }
}

console.log('\nExpected Supabase format:');
console.log('postgresql://[user]:[password]@[host]:[port]/[database]?[params]');
console.log('\nFor your connection:');
console.log('Host should be: aws-1-eu-central-1.pooler.supabase.com');
console.log('Port should be: 6543');
console.log('User should be: postgres.lbqdbjqmlqmqgrwlcjzd');
console.log('Database should be: postgres');
