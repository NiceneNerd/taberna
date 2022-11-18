use anyhow::{Context, Result};
use indexmap::IndexMap;
use roead::{aamp::*, h, types::FixedSafeString};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableItem {
    pub sort: usize,
    pub name: String,
    pub num: usize,
    pub adjust_price: isize,
    pub look_get_flag: bool,
    pub amount: usize,
}

pub fn table_from_obj(obj: &ParameterObject) -> Result<Vec<TableItem>> {
    let item_count = obj
        .get(h!("ColumnNum"))
        .context("Shop table missing item count")?
        .as_int()? as usize;
    let table = (1..=item_count)
        .map(|i| -> Result<TableItem> {
            let sort = obj
                .get(format!("ItemSort{:3}", i))
                .context("Item in shop table missing sort value")?
                .as_int()? as usize;
            let name = obj
                .get(format!("ItemName{:3}", i))
                .context("Item in shop table missing name value")?
                .as_str()?
                .to_owned();
            let num = obj
                .get(format!("ItemNum{:3}", i))
                .context("Item in shop table missing num value")?
                .as_int()? as usize;
            let adjust_price = obj
                .get(format!("ItemAdjustPrice{:3}", i))
                .context("Item in shop table missing adjust price value")?
                .as_int()? as isize;
            let look_get_flag = obj
                .get(format!("ItemLookGetFlag{:3}", i))
                .context("Item in shop table missing look get flag value")?
                .as_bool()?;
            let amount = obj
                .get(format!("ItemAmount{:3}", i))
                .context("Item in shop table missing amount value")?
                .as_int()? as usize;
            Ok(TableItem {
                sort,
                name,
                num,
                adjust_price,
                look_get_flag,
                amount,
            })
        })
        .collect::<Result<_>>()?;
    Ok(table)
}

pub fn table_to_obj(table: &[TableItem]) -> ParameterObject {
    ParameterObject::new()
        .with_parameter("ColumnNum", Parameter::Int(table.len() as i32))
        .with_parameters(table.iter().enumerate().flat_map(|(i, item)| {
            [
                (format!("ItemSort{:3}", i), Parameter::Int(item.sort as i32)),
                (
                    format!("ItemName{:3}", i),
                    Parameter::String64(Box::new(item.name.as_str().into())),
                ),
                (format!("ItemNum{:3}", i), Parameter::Int(item.num as i32)),
                (
                    format!("ItemAdjustPrice{:3}", i),
                    Parameter::Int(item.adjust_price as i32),
                ),
                (
                    format!("ItemLookGetFlag{:3}", i),
                    Parameter::Bool(item.look_get_flag),
                ),
                (
                    format!("ItemAmount{:3}", i),
                    Parameter::Int(item.amount as i32),
                ),
            ]
            .into_iter()
        }))
}

pub fn parse_tables(table_data: &ParameterIO) -> Result<IndexMap<String, Vec<TableItem>>> {
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
                .get(format!("Table{:2}", i))
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
