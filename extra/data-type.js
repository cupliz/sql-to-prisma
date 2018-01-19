module.exports = function getDataType(type) {
  switch (type) {
    case 'id':
      return 'ID'
      break
    case 'tinyint':
      return 'Int'
      break
    case 'int':
      return 'Int'
      break
    case 'float':
      return 'Float'
      break
    case 'decimal':
      return 'Float'
      break
    case 'char':
      return 'String'
      break
    case 'varchar':
      return 'String'
      break
    case 'text':
      return 'String'
      break
    case 'boolean':
      return 'Boolean'
      break
    case 'datetime':
      return 'DateTime'
      break
    case 'date':
      return 'DateTime'
      break
    default:
      return type
  }
}
