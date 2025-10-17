/* eslint-disable @typescript-eslint/no-explicit-any */

import { Table, Tag } from 'antd';
import { FaRegHandshake } from 'react-icons/fa';
import { MdDelete, MdEdit } from 'react-icons/md';
import styles from '../styles/working_group.module.css';

const { Column } = Table;

export interface TableWorkingGroupDataType {
    key: React.Key;
    name: string;
    description: string;
    slug: number;
    id: string;
}

const handleEdit = (id: string) => {
    console.log(id);
};

const handleDelete = (id: string) => {
    console.log(id);
};

const handleJoin = (id: string) => {
    console.log(id);
};

interface WorkingGroupTableProps {
    dataSource: TableWorkingGroupDataType[];
    pagination: any;
    onChange: (pagination: any) => void;
    loading: boolean;
}

export default function WorkingGroupTable({ dataSource, pagination, onChange, loading }: WorkingGroupTableProps) {
    return (
        <>
            <Table<TableWorkingGroupDataType>
                dataSource={dataSource}
                className={styles.table}
                pagination={{
                    ...pagination,
                    position: ['topLeft'],

                    showTotal: total => (
                        <Tag color="blue" style={{ direction: 'ltr' }}>{`${total} working_group found`}</Tag>
                    ),
                    className: styles.pagination,
                }}
                onChange={onChange}
                loading={loading}
                rowKey="id"
            >
                <Column
                    title="Actions"
                    key="action"
                    width={100}
                    render={(_: unknown, record: TableWorkingGroupDataType) => (
                        <div className={styles.actions}>
                            <div onClick={() => handleJoin(record.id)}>
                                <FaRegHandshake className={styles.joinIcon} />
                            </div>
                            <div onClick={() => handleEdit(record.id)}>
                                <MdEdit className={styles.editIcon} />
                            </div>
                            <div onClick={() => handleDelete(record.id)}>
                                <MdDelete className={styles.deleteIcon} />
                            </div>
                        </div>
                    )}
                />
                <Column title="Slug" dataIndex="slug" key="slug" width="20%" />
                <Column title="Description" dataIndex="description" key="description" width="35%" />
                <Column title="Name" dataIndex="name" key="name" width="30%" />
            </Table>
        </>
    );
}
