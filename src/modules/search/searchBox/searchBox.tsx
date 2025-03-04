import type { SearchBoxInterface } from "../types/searchBox"
export default function SearchBox({data}: {data:SearchBoxInterface[]}) {
  return <div style={{
    position: 'absolute',
    width: '100%',
    border: '1px solid black',
    top: '100%',
    visibility: data.length > 0 ? 'visible' : 'hidden'
  }}>
    {
      data.map((item, index) => <div key={index}>{item.name}</div>)
    }

  </div>
}