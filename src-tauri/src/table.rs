use anyhow::{Context, Result};
use indexmap::IndexMap;
use roead::{aamp::*, h};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TableItem {
    pub sort: usize,
    pub num: usize,
    pub adjust_price: isize,
    pub look_get_flag: bool,
    pub amount: usize,
}

pub type Table = IndexMap<String, TableItem>;

pub fn table_from_obj(obj: &ParameterObject) -> Result<Table> {
    let item_count = obj
        .get(h!("ColumnNum"))
        .context("Shop table missing item count")?
        .as_int()? as usize;
    let table = (1..=item_count)
        .map(|i| -> Result<(String, TableItem)> {
            let sort = obj
                .get(format!("ItemSort{:03}", i))
                .context("Item in shop table missing sort value")?
                .as_int()? as usize;
            let name = obj
                .get(format!("ItemName{:03}", i))
                .context("Item in shop table missing name value")?
                .as_str()?
                .to_owned();
            let num = obj
                .get(format!("ItemNum{:03}", i))
                .context("Item in shop table missing num value")?
                .as_int()? as usize;
            let adjust_price = obj
                .get(format!("ItemAdjustPrice{:03}", i))
                .context("Item in shop table missing adjust price value")?
                .as_int()? as isize;
            let look_get_flag = obj
                .get(format!("ItemLookGetFlg{:03}", i))
                .context("Item in shop table missing look get flag value")?
                .as_bool()?;
            let amount = obj
                .get(format!("ItemAmount{:03}", i))
                .context("Item in shop table missing amount value")?
                .as_int()? as usize;
            Ok((name, TableItem {
                sort,
                num,
                adjust_price,
                look_get_flag,
                amount,
            }))
        })
        .collect::<Result<_>>()?;
    Ok(table)
}

pub fn table_to_obj(table: IndexMap<String, TableItem>) -> ParameterObject {
    ParameterObject::new()
        .with_parameter("ColumnNum", Parameter::Int(table.len() as i32))
        .with_parameters(table.iter().enumerate().flat_map(|(i, (name, item))| {
            [
                (
                    format!("ItemSort{:03}", i),
                    Parameter::Int(item.sort as i32),
                ),
                (
                    format!("ItemName{:03}", i),
                    Parameter::String64(Box::new(name.as_str().into())),
                ),
                (format!("ItemNum{:03}", i), Parameter::Int(item.num as i32)),
                (
                    format!("ItemAdjustPrice{:03}", i),
                    Parameter::Int(item.adjust_price as i32),
                ),
                (
                    format!("ItemLookGetFlg{:03}", i),
                    Parameter::Bool(item.look_get_flag),
                ),
                (
                    format!("ItemAmount{:03}", i),
                    Parameter::Int(item.amount as i32),
                ),
            ]
            .into_iter()
        }))
}

pub fn parse_tables(table_data: &ParameterIO) -> Result<IndexMap<String, Table>> {
    let header = table_data
        .object(h!("Header"))
        .context("Shop table data missing header")?;
    let table_count = header
        .get(h!("TableNum"))
        .context("Shop table header missing table count")?
        .as_int()? as usize;
    let table_names: Vec<String> = (1..=table_count)
        .map(|i| -> Result<String> {
            Ok(header
                .get(format!("Table{:02}", i))
                .context("Shop table header missing a table name")?
                .as_str()?
                .to_owned())
        })
        .collect::<Result<_>>()?;
    table_names
        .into_iter()
        .map(|name| {
            Ok((
                name.clone(),
                table_from_obj(
                    table_data
                        .object(&name)
                        .with_context(|| format!("Shop table data missing table {}", name))?,
                )?,
            ))
        })
        .collect::<_>()
}

pub fn tables_to_pio(table_data: IndexMap<String, Table>) -> ParameterIO {
    ParameterIO::new()
        .with_object(
            "Header",
            ParameterObject::new()
                .with_parameter("TableNum", Parameter::Int(table_data.len() as i32))
                .with_parameters(table_data.keys().enumerate().map(|(i, k)| {
                    (
                        format!("Table{:02}", i),
                        Parameter::String64(Box::new(k.as_str().into())),
                    )
                })),
        )
        .with_objects(
            table_data
                .into_iter()
                .map(|(name, table)| (name, table_to_obj(table))),
        )
}
