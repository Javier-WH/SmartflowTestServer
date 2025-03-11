import React from 'react';
import { Table } from 'antd';
import styles from "../styles/organizations.module.css"
import { MdEdit, MdDelete } from "react-icons/md";


const { Column } = Table;

export interface TableOrganizationDataType {
  key: React.Key;
  name: string;
  description: string;
  slug: number;
  id: string;
}


const handleEdit = (id: string) => {
  console.log(id)
}

const handleDelete = (id: string) => {
  console.log(id)
}

export default function OrganizationTable({ dataSource}: { dataSource: TableOrganizationDataType[] }) {
  return <Table<TableOrganizationDataType> 
    pagination={{ position: ["topLeft"]}}
    dataSource={dataSource}
    className={styles.table}
    >
    <Column
      title="Actions"
      key="action"
      width={100}
  
      render={(_: unknown, record: TableOrganizationDataType) => (
          <div className={styles.actions}>
            <div onClick={() => handleEdit(record.id)}><MdEdit className={styles.editIcon}/></div>
          <div onClick={() => handleDelete(record.id)}><MdDelete className={styles.deleteIcon} /></div>
          </div>
      )}
    />
    <Column title="Slug" dataIndex="slug" key="slug" width="20%" />
    <Column title="Description" dataIndex="description" key="description" width="35%" />
    <Column title="Name" dataIndex="name" key="name" width="30%" />
  </Table>
}

