'use client'

export default function Top10({ entries = [] }) {
  return (
    <div style={{ marginTop: 16 }}>
      <h3 className="udacity-blue">Top 10</h3>
      <table style={{ margin: '0 auto', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Time (s)</th>
            <th>Difficulty</th>
            <th>Hints</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(0,0,0,0.04)' }}>
              <td style={{ padding: 6 }}>{i + 1}</td>
              <td style={{ padding: 6 }}>{e.name}</td>
              <td style={{ padding: 6 }}>{e.time}</td>
              <td style={{ padding: 6 }}>{e.difficulty}</td>
              <td style={{ padding: 6 }}>{e.hints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
