export const onExist = async ({
  field = "id",
  cond = "=",
  value,
  data = {},
  cols = "id",
  module,
  execute,
}: {
  field?: string;
  cond?: string;
  value: string;
  data?: any;
  cols?: string;
  module: string;
  execute: Function;
}) => {
  let notSame = "";
  if (data?.id && data?.id != "") {
    notSame = "|id,!=," + data.id + ",a,";
  }
  const {data: row} = await execute("/" + module, "GET", {
    perPage: 1,
    page: 1,
    searchBy: field + "," + cond + "," + value + ",a," + notSame,
    cols: cols,
    _exist: 1,
    ...data,
  });
  if (row?.success == true) {
    let condominio = {};
    if (row?.existCondominio) {
      condominio = {existCondominio: row.existCondominio};
    }
    return row.data?.length > 0 ? {...row.data[0], ...condominio} : false;
  } else {
    return false;
  }
};