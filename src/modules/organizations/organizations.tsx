/* eslint-disable @typescript-eslint/no-explicit-any */
import OrganizationTable, {TableOrganizationDataType} from "./organizationTable/organizationTable"
import { /*useContext,*/ useEffect, useState } from "react";
//import { AuthContext, AuthContextType } from "../auth/context/auth";
import useOrganizations from "./hook/useOrganizations";
import styles from "./styles/organizations.module.css"
import { Button, Input, InputNumber } from "antd";


export default function Organizations() {
  const { getOrganizations } = useOrganizations();
  const [organizationsData, setOrganizationsData] = useState<TableOrganizationDataType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageSizeInputValue, setPageSizeInputValue] = useState(10);
  const [pageSize, setPageSize] = useState(10);
  const [nameFilter, setNameFilter] = useState('');
  const [nameFilterInputValue, setNameFilterInputValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getOrganizations(currentPage, pageSize, nameFilter);

        if (response.error || !response.data) return;

        const organizationsList = response.data.map((organization) => ({
          key: organization.id, // Usar ID real como key
          name: organization.name,
          description: organization.description,
          slug: organization.slug,
          id: organization.id
        }));

        setOrganizationsData(organizationsList);
        setTotalItems(response.count || 0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, nameFilter]);

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
  };

  const handlePageSizeChange = () => {
    setPageSize(pageSizeInputValue);
  }

  const handleNameFilterChange = () => {
    setNameFilter(nameFilterInputValue);
  }

  return (
    <div className={styles.organizationContainer}>
      <div className={styles.searchContainer}>
        <div>
          <h5>Search</h5>
          <Input value={nameFilterInputValue} onChange={(e) => setNameFilterInputValue(e.target.value)} style={{ minWidth: "300px" }} placeholder="Buscar organizaciones" />
          <Button onClick={handleNameFilterChange}>Search</Button>
        </div>
        <div>
          <h5>Results per page</h5>
          <InputNumber placeholder="Resultados por página" value={pageSizeInputValue} onChange={(value) => value !== null && setPageSizeInputValue(value)} />
          <Button onClick={handlePageSizeChange}>{">"}</Button>
        </div>
      </div>
      <OrganizationTable
        dataSource={organizationsData}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: false
        }}
        onChange={handleTableChange}
        loading={loading}
      />
    </div>
  );
}