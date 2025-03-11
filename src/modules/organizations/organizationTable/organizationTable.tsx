/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Table } from 'antd';
import styles from "../styles/organizations.module.css"
import { MdEdit, MdDelete } from "react-icons/md";
import { FaRegHandshake } from "react-icons/fa";


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

const handleJoin = (id: string) => {
  console.log(id)
}

interface OrganizationTableProps {
  dataSource: TableOrganizationDataType[];
  pagination: any;
  onChange: (pagination: any) => void;
  loading: boolean;
}

export default function OrganizationTable({
  dataSource,
  pagination,
  onChange,
  loading
}: OrganizationTableProps) {
  return <>
    <Table<TableOrganizationDataType>
      dataSource={dataSource}
      className={styles.table}
      pagination={{
        ...pagination,
        position: ["topLeft"],
   
        showTotal: (total) => `Total ${total} organizaciones`,
        className: styles.pagination
      }}
      onChange={onChange}
      loading={loading}
      rowKey="id"
    >
      <Column
        title="Actions"
        key="action"
        width={100}

        render={(_: unknown, record: TableOrganizationDataType) => (
          <div className={styles.actions}>
            <div onClick={() => handleJoin(record.id)}><FaRegHandshake className={styles.joinIcon} /></div>
            <div onClick={() => handleEdit(record.id)}><MdEdit className={styles.editIcon} /></div>
            <div onClick={() => handleDelete(record.id)}><MdDelete className={styles.deleteIcon} /></div>
          </div>
        )}
      />
      <Column title="Slug" dataIndex="slug" key="slug" width="20%" />
      <Column title="Description" dataIndex="description" key="description" width="35%" />
      <Column title="Name" dataIndex="name" key="name" width="30%" />
    </Table>
  </>
}

