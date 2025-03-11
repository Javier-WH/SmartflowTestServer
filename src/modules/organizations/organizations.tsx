import OrganizationTable, {TableOrganizationDataType} from "./organizationTable/organizationTable"
import styles from "./styles/organizations.module.css"

export default function Organizations(){

  const data: TableOrganizationDataType[] = [
    {
      key: '1',
      name: 'John',
      description: 'Brown',
      slug: 32,
      id: '1',
    },
    {
      key: '2',
      name: 'JohnXD',
      description: 'Brown',
      slug: 32,
      id: '2',
    },
    {
      key: '3',
      name: 'John',
      description: 'Brown',
      slug: 32,
      id: '3',
    },
  ];

  return <div className={styles.organizationContainer}>
    <OrganizationTable dataSource={data} />
  </div>
}