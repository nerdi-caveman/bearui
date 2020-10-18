import React, { useState } from "react"
import {
  Container,
  Card,
  DataList,
  Chip,
  FlexRow,
  Grid,
  Button,
  LinkButton,
} from "@rap/ui"
import { Link } from "react-router-dom"
import { invoiceData, InvoiceListProp } from "./mock"

const Invoice: React.FC<any> = () => {
  const [invoiceList, setInvoiceList] = useState<InvoiceListProp[]>(invoiceData)

  return (
    <Container>
      <Grid xsCol="12">
        <Card withBackground={false}>
          <FlexRow gap="10px" position="center" align="left">
            <h3>Invoice</h3>
          </FlexRow>
        </Card>
        <Card xsCol="12" withBackground={false}>
          <DataList
            onRowSelect={(data: any[]) => {
              // console.log(data)
            }}
            menu={
              <>
                <Button icon="mdiPlus">Add New</Button>
              </>
            }
            defaultSortIndex={1}
            uniqueIdentifier="_id"
            actionList={[
              {
                color: "primary",
                text: "Edit",
                onClick: (value: InvoiceListProp, idx: number) => {
                  console.log(value)
                },
              },
              {
                color: "danger",
                text: "Delete",
                onClick: (value: any, idx: number) => {
                  const tmp = invoiceList.filter(invoice => invoice !== value)
                  setInvoiceList(tmp)
                },
              },
            ]}
            renderRule={[
              {
                selector: "number",
                onRender: (data: any) => {
                  return "#" + data.number
                },
              },
              {
                selector: "total_cost",
                onRender: (data: any) => {
                  return "$" + data.total_cost
                },
              },
              {
                selector: "view",
                onRender: (data: any) => {
                  return (
                    <LinkButton background="info" to={"invoice/" + data.number}>
                      View
                    </LinkButton>
                  )
                },
              },
              {
                selector: "status",
                onRender: (data: any) => {
                  if (data.status === 0) {
                    return <Chip color="warning">Pending</Chip>
                  } else if (data.status === 1) {
                    return <Chip color="info">Shipped</Chip>
                  } else if (data.status === 2) {
                    return <Chip color="success">Delivered</Chip>
                  } else if (data.status === 3) {
                    return <Chip color="danger">Canceled</Chip>
                  } else {
                    return <Chip color="warning">Pending</Chip>
                  }
                },
              },
            ]}
            columns={[
              { name: "NO.", selector: "number" },
              { name: "Bill From", selector: "bill_from" },
              { name: "Bill To", selector: "bill_to" },
              { name: "Total Cost", selector: "total_cost" },
              { name: "Status", selector: "status" },
              { name: "View", selector: "view" },
            ]}
            document={invoiceList}
          ></DataList>
        </Card>
      </Grid>
    </Container>
  )
}
export default Invoice
