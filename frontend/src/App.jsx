import { useState } from 'react'
import axios from 'axios'
import Select from 'react-select'
import './App.css'

const API_URL = 'https://bajaj-y2y6.onrender.com/bfhl'

const filterOptions = [
  { value: 'alphabets', label: 'Alphabets' },
  { value: 'numbers', label: 'Numbers' },
  { value: 'highest_lowercase_alphabet', label: 'Highest lowercase alphabet' }
]

function App() {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')
  const [response, setResponse] = useState(null)
  const [selectedFilters, setSelectedFilters] = useState([])
  const [loading, setLoading] = useState(false)

  const validateJSON = (str) => {
    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResponse(null)

    if (!validateJSON(jsonInput)) {
      setError('Invalid JSON format')
      return
    }

    const parsedData = JSON.parse(jsonInput)
    if (!parsedData.data || !Array.isArray(parsedData.data)) {
      setError('JSON must contain a "data" array')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(API_URL, parsedData)
      setResponse(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'API call failed')
    } finally {
      setLoading(false)
    }
  }

  const renderFilteredResponse = () => {
    if (!response || selectedFilters.length === 0) return null

    const filtered = {}
    selectedFilters.forEach(filter => {
      if (response[filter.value] !== undefined) {
        filtered[filter.label] = response[filter.value]
      }
    })

    return (
      <div className="response-box">
        <h3>Filtered Response</h3>
        <pre>{JSON.stringify(filtered, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>BFHL Challenge</h1>
      
      <form onSubmit={handleSubmit} className="form">
        <label>
          API Input (JSON):
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{ "data": ["A", "C", "z", "1", "2"] }'
            rows={6}
            className="json-input"
          />
        </label>
        
        {error && <div className="error">{error}</div>}
        
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {response && (
        <div className="filters">
          <label>Multi Filter:</label>
          <Select
            isMulti
            options={filterOptions}
            value={selectedFilters}
            onChange={setSelectedFilters}
            className="select-dropdown"
            placeholder="Select filters..."
          />
        </div>
      )}

      {renderFilteredResponse()}

      {response && (
        <div className="full-response">
          <h3>Full Response</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App
