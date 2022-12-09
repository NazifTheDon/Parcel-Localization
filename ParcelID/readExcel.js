let XLSX = require('xlsx')
let workbook = XLSX.readFile('Jolla 5 Primary Parcels.xlsx')

let worksheet = workbook.Sheets[workbook.SheetNames[0]]
let parcel =[]
for(let index = 2; index < 43; index++){
  parcel.push(worksheet[`A${index}`].v)
}

console.log(parcel);
module.exports = parcel
//let parcelArray = parcel
//console.log(parcelArray);