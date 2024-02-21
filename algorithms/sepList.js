exports.sepList = ({ list, sep }) => {
    var newVar = ''
    list.forEach((item, i) => {
      if (list.length === 1) {
        newVar += item
      } else {
        if (i) {
          newVar += sep + ' ' + item
        } else {
          newVar += item
        }
      }
    })
    return newVar
  }