/*
 varchar primary keys (USR-001) cannot use AUTO_INCREMENT, so new IDs are created  here
 this reads the highest existingcnumeric suffix for the prefix, add one, and zero-pad to 3 digits
 */
async function genId(db, table, column, prefix) {
  const [rows] = await db.query(
    `SELECT ${column} AS id
       FROM ${table}
      WHERE ${column} LIKE ?
      ORDER BY CAST(SUBSTRING(${column}, ?) AS UNSIGNED) DESC
      LIMIT 1`,
    [`${prefix}-%`, prefix.length + 2] // +2 skips "PREFIX" and the "-"
  );

  let next = 1;
  if (rows.length) {
    const match = String(rows[0].id).match(/(\d+)$/);
    if (match) next = parseInt(match[1], 10) + 1;
  }
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

module.exports = { genId };