import React, { useState, useEffect } from "react"
import styled, { StyledComponent } from "styled-components"
import { DatatableComponent, DatatableColumns, DatatableRule } from "../types"
import { useTheme, useThemeMode } from "../theme"
import { darken } from "polished"
import { mdiArrowUp } from "@mdi/js"
import Icon from "@mdi/react"

type TableBodyStyle = {
  background: string
  striped: boolean
  stripedColor: string
}

const Table: StyledComponent<"table", any, any> = styled.table`
  font-size: 14px;
  border-collapse: collapse;
  width: 100%;
`

const CheckBox: StyledComponent<"input", any> = styled.input`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: none;
  transition: opacity 0.35s;
  opacity: 0;
  cursor: pointer;
`

const TableHead: StyledComponent<"thead", any> = styled.thead`
  position: relative;
  tr.select {
    input[type="checkbox"] {
      opacity: 1;
    }
    &.selected input[type="checkbox"] {
      display: block;
    }
    th {
      position: relative;

      &:first-child {
        padding-left: 35px;
      }
    }
  }
  th {
    padding: 15px 20px;
    padding-right: 15px;
    text-align: left;
    font-size: 12px;
    position: relative;

    svg {
      opacity: 0;
      transition: all 0.35s;
      position: absolute;
      top: 50%;
      transform-origin: top;
      transform: translateY(-50%);
    }

    &.rap-asc,
    &.rap-desc {
      svg {
        opacity: 1;
      }
    }

    &.rap-asc {
      svg {
        transform: rotate(0deg) translateY(-50%);
      }
    }
    &.rap-desc {
      svg {
        transform: rotate(180deg) translateY(-50%);
      }
    }

    button {
      background: transparent;
      text-transform: uppercase;
      outline: none;
      border: none;
      font-size: inherit;
      letter-spacing: 0.8px;
      cursor: pointer;
      font-weight: inherit;
      font-family: inherit;
      position: relative;
    }
  }
`
const TableBody: StyledComponent<"tbody", any, TableBodyStyle> = styled.tbody`
  tr {
    text-align: left;
    cursor: pointer;
    transition: background 0.35s;
    border-radius: 30px;
    position: relative;
    border-top: 1px solid ${(props: any) => props.background};

    &:hover,
    &.selected {
      background: ${(props: any) => darken(0.05, props.background)};
    }

    &:hover input[type="checkbox"],
    &.selected input[type="checkbox"] {
      opacity: 1;
    }

    ${(props: any) =>
      props.striped &&
      `&:nth-child(2n + 1) {
        background: ${darken(0, props.stripedColor)};
      }
  `}

    &.select {
      td {
        &:first-child {
          padding-left: 35px;
        }

        input[type="checkbox"] {
          display: block;
        }
      }
    }

    td {
      text-align: left;
      padding: 10px 20px;
      padding-right: 15px;
      position: relative;
      vertical-align: middle;
    }
  }
`
const Datatable: React.FC<DatatableComponent> = ({
  title,
  document,
  columns,
  renderRule = [],
  striped = false,
  check = false,
  defaultSortIndex = 1,
  onRowSelect,
  onRowClick,
  ...props
}) => {
  const theme = useTheme()
  const [themeMode] = useThemeMode()
  const background: string = theme[themeMode].cardbackground
  const [selected, setSelected] = useState<Map<number | string, boolean>>(
    new Map()
  )
  const [selectAll, setSelectAll] = useState<boolean>(false)
  const [data, setData] = useState<any[]>(document)
  const [toggleSortIndex, setToggleSortIndex] = useState<number>(
    defaultSortIndex
  )

  const throwInvalidPropErr = (expected: string, recieved: string) => {
    throw new Error(`Expected '${expected}' but got ${recieved}`)
  }
  const throwErr = (message: string) => {
    throw new Error(`${message}`)
  }

  const sortDocumentASC = (selector: string, unsortedData: any[]): any[] => {
    const merge = (left, right) => {
      let resultArray = [],
        leftIndex = 0,
        rightIndex = 0
      while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex][selector] < right[rightIndex][selector]) {
          resultArray.push(left[leftIndex])
          leftIndex++
        } else {
          resultArray.push(right[rightIndex])
          rightIndex++
        }
      }

      return resultArray
        .concat(left.slice(leftIndex))
        .concat(right.slice(rightIndex))
    }

    const mergeSort = (unsortedData: any[]): any[] => {
      if (unsortedData.length <= 1) {
        return unsortedData
      }

      const middle = Math.floor(unsortedData.length / 2)

      const left = unsortedData.slice(0, middle)
      const right = unsortedData.slice(middle)

      return merge(mergeSort(left), mergeSort(right))
    }
    return mergeSort(unsortedData)
  }
  const sortDocumentDESC = (selector: string, unsortedData: any[]): any[] => {
    return sortDocumentASC(selector, unsortedData).reverse()
  }

  const toggleCheck = (idx: number | string): Map<number | string, boolean> => {
    let prevState: Map<number | string, boolean> = new Map(selected)
    prevState.set(idx, !prevState.get(idx))
    // deselect all is check is false
    if (!!!prevState.get(idx)) {
      setSelectAll(false)
    } else {
      if (prevState.size === data.length) {
        // find if a value is false then deselectAll else select all
        const checkedValues: boolean[] = Array.from(prevState.values())
        setSelectAll(!checkedValues.includes(false))
      }
    }
    setSelected(prevState)
    return prevState
  }

  const toggleSelectAll = () => {
    let prevState: Map<number | string, boolean> = new Map(selected)
    // selecte all
    if (!selectAll) {
      data.forEach((itemData, idx: number) => {
        prevState.set(itemData.id, true)
      })
      setSelected(prevState)
      setSelectAll(true)
    }
    // deselect all
    else {
      prevState.clear()
      setSelected(prevState)
      setSelectAll(false)
    }
  }

  const toggleSort = (e: any, selector: any, idx: number) => {
    setToggleSortIndex(idx)

    if (e.target.parentElement.classList.contains("rap-asc")) {
      setData(sortDocumentDESC(selector, data))
      e.target.parentElement.classList.remove("rap-asc")
      e.target.parentElement.classList.add("rap-desc")
    } else {
      setData(sortDocumentASC(selector, data))
      e.target.parentElement.classList.remove("rap-desc")
      e.target.parentElement.classList.add("rap-asc")
    }
  }

  const getSelectorRenderRule = (selector: string): DatatableRule => {
    return renderRule.find(item => item.selector === selector)
  }

  const renderColumnData = (selector: string, data: any) => {
    if (!renderRule) return data[selector]
    const selectorRule: DatatableRule = getSelectorRenderRule(selector)

    if (selectorRule) {
      return selectorRule.onRender(data)
    } else {
      return data[selector]
    }
  }

  const getSelectorRowData = (mapData: Map<number | string, boolean>): any => {
    const mapToArr: [string | number, boolean][] = Array.from(mapData)
    let selectedRows = []
    for (let i = 0; i < mapToArr.length; i++) {
      // get the id from map converted to array
      const rowMapIdx: string | number = mapToArr[i][0]
      const rowMapData: boolean = mapToArr[i][1]
      if (rowMapData) {
        // find match of id in sorted data and push to array
        selectedRows.push(
          data.find((rowData: any) => +rowData.id === +rowMapIdx)
        )
      }
    }
    return selectedRows
  }

  useEffect(() => {
    setData(sortDocumentASC(columns[defaultSortIndex].selector, data))
  }, [])

  return (
    <div
      style={{ overflow: "hidden", width: "100%", overflowX: "auto" }}
      {...props}
    >
      {title && <p>{title}</p>}
      <table></table>
      <Table>
        <TableHead id="rap-t-hd">
          <tr
            className={
              check ? (selected.size ? "select selected" : "select") : ""
            }
          >
            <th>
              {check && (
                <CheckBox
                  type="checkbox"
                  checked={selectAll}
                  onChange={() => {
                    toggleSelectAll()
                    onRowSelect(!selectAll ? data : [])
                  }}
                />
              )}
              #
            </th>

            {columns.map((item: DatatableColumns, idx: number) => (
              <th
                key={idx}
                className={idx === +toggleSortIndex ? "rap-asc" : ""}
              >
                {item.name && item.selector ? (
                  <>
                    <button
                      onClick={e => {
                        toggleSort(e, item.selector, idx)
                      }}
                    >
                      {item.name}
                    </button>
                    <Icon
                      path={mdiArrowUp}
                      color={themeMode === "lightmode" ? "#222" : "#ffffff"}
                      size={0.55}
                    />
                  </>
                ) : (
                  throwErr(
                    `Columns must have properties 'name' and 'selector' in array of objects`
                  )
                )}
              </th>
            ))}
          </tr>
        </TableHead>
        <TableBody
          background={darken(0.075, background)}
          striped={striped}
          stripedColor={theme.colors.primary}
        >
          {data.map((dataItem: any, idx: number) => (
            <tr
              key={idx}
              className={
                check
                  ? selected.get(dataItem.id)
                    ? "select selected"
                    : "select"
                  : ""
              }
              onClick={(e: any) => {
                if (e.target.id !== "rap-cb-" + idx) {
                  onRowClick(dataItem)
                }
              }}
            >
              <td style={{ fontSize: "12px" }}>
                {check && (
                  <CheckBox
                    id={"rap-cb-" + idx}
                    checked={!!selected.get(dataItem.id)}
                    type="checkbox"
                    onChange={() => {
                      toggleCheck(dataItem.id)
                      onRowSelect(getSelectorRowData(toggleCheck(dataItem.id)))
                    }}
                  />
                )}
                {idx + 1}
              </td>
              {columns.map((column: any, idx: number) => (
                <td key={idx}>{renderColumnData(column.selector, dataItem)}</td>
              ))}
            </tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
export default Datatable
