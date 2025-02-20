export const formatNumber = (num: any, dec = 2, sepDec = ".", sepMil = ",") => {
  if (isNaN(Number(num))) return Number(0).toFixed(dec);
  let numFormat = Number(num).toFixed(dec).split(".");
  numFormat[0] = numFormat[0].replace(/\B(?=(\d{3})+(?!\d))/g, sepMil);
  return numFormat.join(sepDec);
};
