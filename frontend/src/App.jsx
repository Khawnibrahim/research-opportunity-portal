import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const blank = {
  title: '', description: '', research_area: '', faculty_name: '',
  department: '', required_skills: '', available_positions: 1,
  application_deadline: '', status: 'Open'
};

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(API + path, {
      headers: { 'Content-Type': 'application/json' }, ...options
    });
  } catch {
    throw new Error('Could not reach the server. Check if the backend is running.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.errors?.join(', ') || data.message || 'Something went wrong');
  }
  return data;
}

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : '';
}

export default function App() {
  const [opportunities, setOpportunities] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function loadOpportunities() {
    try {
      setOpportunities(await request('/opportunities'));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { loadOpportunities(); }, []);

  function startNew() {
    setForm({ ...blank });
    setEditingId(null);
    setShowForm(true);
    setSelected(null);
    setError('');
  }

  function startEdit(item) {
    setForm({ ...item, application_deadline: dateOnly(item.application_deadline) });
    setEditingId(item.id);
    setShowForm(true);
    setSelected(null);
    setError('');
  }

  async function viewDetails(id) {
    setError('');
    try {
      setSelected(await request('/opportunities/' + id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveOpportunity(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    const details = { ...form, available_positions: Number(form.available_positions) };
    delete details.id;
    delete details.created_at;
    delete details.updated_at;

    try {
      if (editingId === null) {
        await request('/opportunities', { method: 'POST', body: JSON.stringify(details) });
        setMessage('Research opportunity added.');
      } else {
        await request('/opportunities/' + editingId, { method: 'PUT', body: JSON.stringify(details) });
        setMessage('Changes saved.');
      }
      setShowForm(false);
      await loadOpportunities();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function closeOpportunity(item) {
    setError('');
    try {
      await request('/opportunities/' + item.id, {
        method: 'PUT', body: JSON.stringify({ status: 'Closed' })
      });
      setMessage('Opportunity marked as closed.');
      setSelected(null);
      await loadOpportunities();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteOpportunity(item) {
    if (!window.confirm('Delete "' + item.title + '"?')) return;
    setError('');
    try {
      await request('/opportunities/' + item.id, { method: 'DELETE' });
      setMessage('Opportunity deleted.');
      setSelected(null);
      await loadOpportunities();
    } catch (err) {
      setError(err.message);
    }
  }

  const shown = opportunities.filter(item => {
    const text = [item.title, item.faculty_name, item.research_area, item.department, item.required_skills]
      .join(' ').toLowerCase();
    return text.includes(search.toLowerCase()) &&
      (statusFilter === 'All' || item.status === statusFilter);
  });

  const fields = [
    ['title', 'Research title'],
    ['research_area', 'Research area'],
    ['faculty_name', 'Faculty member'],
    ['department', 'Department'],
    ['required_skills', 'Required skills']
  ];

  return (
    <div className="container">
      <header>
        <div>
          <p className="overline">FAST NUCES · Peshawar</p>
          <h1>Research Opportunity Portal</h1>
          <p>View and manage research openings posted by faculty.</p>
        </div>
        <button className="primary" onClick={startNew}>+ Add opportunity</button>
      </header>

      {message && <div className="message">{message}</div>}
      {error && <div className="error" role="alert">{error}</div>}

      <section className="list-section">
        <div className="toolbar">
          <input value={search} onChange={event => setSearch(event.target.value)}
            placeholder="Search opportunities" aria-label="Search opportunities" />
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
            <option>All</option><option>Open</option><option>Closed</option>
          </select>
        </div>
        <p className="count">Showing {shown.length} of {opportunities.length} opportunities</p>
        {shown.length === 0 && <p className="empty">No opportunities to show.</p>}
        {shown.map(item => (
          <article className="opportunity" key={item.id}>
            <div className="card-heading">
              <h2>{item.title}</h2>
              <span className={item.status === 'Open' ? 'pill open' : 'pill closed'}>{item.status}</span>
            </div>
            <p>{item.research_area} · {item.department}</p>
            <p>Faculty: {item.faculty_name}</p>
            <p>Positions: {item.available_positions} · Deadline: {dateOnly(item.application_deadline)}</p>
            <div className="actions">
              <button onClick={() => viewDetails(item.id)}>Details</button>
              <button onClick={() => startEdit(item)}>Edit</button>
              {item.status === 'Open' && <button onClick={() => closeOpportunity(item)}>Close</button>}
              <button className="delete" onClick={() => deleteOpportunity(item)}>Delete</button>
            </div>
          </article>
        ))}
      </section>

      {selected && !showForm && (
        <section className="panel">
          <div className="panel-heading"><h2>Opportunity details</h2><button onClick={() => setSelected(null)}>Close</button></div>
          <h3>{selected.title}</h3>
          <p>{selected.description}</p>
          <dl>
            <dt>Research area</dt><dd>{selected.research_area}</dd>
            <dt>Faculty</dt><dd>{selected.faculty_name}</dd>
            <dt>Department</dt><dd>{selected.department}</dd>
            <dt>Skills</dt><dd>{selected.required_skills}</dd>
            <dt>Positions</dt><dd>{selected.available_positions}</dd>
            <dt>Deadline</dt><dd>{dateOnly(selected.application_deadline)}</dd>
            <dt>Status</dt><dd>{selected.status}</dd>
          </dl>
        </section>
      )}

      {showForm && (
        <section className="panel">
          <div className="panel-heading">
            <h2>{editingId === null ? 'New opportunity' : 'Edit opportunity'}</h2>
            <button onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <form onSubmit={saveOpportunity}>
            {fields.map(([key, label]) => (
              <label key={key}>{label}
                <input required value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} />
              </label>
            ))}
            <label>Description
              <textarea required rows="4" value={form.description}
                onChange={event => setForm({ ...form, description: event.target.value })} />
            </label>
            <div className="two-cols">
              <label>Available positions
                <input type="number" min="1" step="1" required value={form.available_positions}
                  onChange={event => setForm({ ...form, available_positions: event.target.value })} />
              </label>
              <label>Application deadline
                <input type="date" required value={dateOnly(form.application_deadline)}
                  onChange={event => setForm({ ...form, application_deadline: event.target.value })} />
              </label>
            </div>
            <label>Status
              <select value={form.status} onChange={event => setForm({ ...form, status: event.target.value })}>
                <option>Open</option><option>Closed</option>
              </select>
            </label>
            <button className="primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save opportunity'}</button>
          </form>
        </section>
      )}
    </div>
  );
}
