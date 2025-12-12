/**
 * Custom hook for CSV/Excel import functionality
 */
import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { normalizeStudentId } from '../utils/validationHelpers'
import { generateStudentEmail, isValidNumericalStudentId } from '../utils/studentIdHelpers'

export function useCSVImport(onImport, onAlert) {
  const [csvFile, setCsvFile] = useState(null)
  const [csvPreview, setCsvPreview] = useState([])
  const [csvImportWarnings, setCsvImportWarnings] = useState([])
  const [isImporting, setIsImporting] = useState(false)

  const parseCSV = useCallback((file) => {
    const fileName = file.name.toLowerCase()
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
    
    if (isExcel) {
      return parseExcel(file)
    } else {
      return parseCSVFile(file)
    }
  }, [])

  const parseExcel = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
          
          const result = detectColumnsAndParse(jsonData, true)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }, [])

  const parseCSVFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target.result
          const lines = text.split(/\r?\n/).filter(line => line.trim())
          
          if (lines.length === 0) {
            reject(new Error('The CSV file appears to be empty.'))
            return
          }
          
          const delimiter = detectDelimiter(lines[0])
          const parsed = parseCSVLines(lines, delimiter)
          resolve(parsed)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsText(file, 'UTF-8')
    })
  }, [])

  const detectDelimiter = useCallback((firstLine) => {
    if (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) {
      return ';'
    } else if (firstLine.includes('\t')) {
      return '\t'
    }
    return ','
  }, [])

  const parseCSVLines = useCallback((lines, delimiter) => {
    const parseLine = (line) => {
      const values = []
      let currentValue = ''
      let insideQuotes = false
      let quoteChar = null
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const nextChar = line[i + 1]
        
        if ((char === '"' || char === "'") && !insideQuotes) {
          insideQuotes = true
          quoteChar = char
          continue
        } else if (char === quoteChar && insideQuotes) {
          if (nextChar === quoteChar) {
            currentValue += char
            i++
            continue
          } else {
            insideQuotes = false
            quoteChar = null
            continue
          }
        }
        
        if (char === delimiter && !insideQuotes) {
          values.push(currentValue.trim())
          currentValue = ''
          continue
        }
        
        currentValue += char
      }
      
      if (currentValue.length > 0 || values.length > 0) {
        values.push(currentValue.trim())
      }
      
      return values
    }

    const firstLineValues = parseLine(lines[0])
    const firstLineLower = firstLineValues.map(v => v.toLowerCase().trim())
    
    const hasIdHeader = firstLineLower.some(v => 
      v === 'id' || v === 'student id' || v === 'student_id' || v.includes('id')
    )
    const hasNameHeader = firstLineLower.some(v => 
      v === 'name' || v === 'student name' || v === 'student_name' || v.includes('name')
    )
    
    let startIndex = 0
    let idColumnIndex = 0
    let nameColumnIndex = 1
    let emailColumnIndex = 2
    
    if (hasIdHeader && hasNameHeader) {
      startIndex = 1
      idColumnIndex = firstLineLower.findIndex(v => 
        v === 'id' || v === 'student id' || v === 'student_id' || v.includes('id')
      )
      nameColumnIndex = firstLineLower.findIndex(v => 
        v === 'name' || v === 'student name' || v === 'student_name' || v.includes('name')
      )
      const emailCol = firstLineLower.findIndex(v => 
        v === 'email' || v.includes('email') || v.includes('@') || v.includes('umindanao')
      )
      emailColumnIndex = emailCol >= 0 ? emailCol : (firstLineValues.length > 2 ? 2 : -1)
    }
    
    const parsed = []
    for (let i = startIndex; i < lines.length; i++) {
      const values = parseLine(lines[i].trim())
      if (values.length >= 2) {
        const id = values[idColumnIndex]?.trim() || ''
        const name = values[nameColumnIndex]?.trim() || ''
        let email = ''
        
        if (emailColumnIndex >= 0 && values.length > emailColumnIndex) {
          email = (values[emailColumnIndex] || '').trim()
          if ((email.startsWith('"') && email.endsWith('"')) || 
              (email.startsWith("'") && email.endsWith("'"))) {
            email = email.slice(1, -1).trim()
          }
        }
        
        if (email && !email.includes('@')) {
          email = ''
        }
        
        if (id && name) {
          parsed.push({ id, name, email })
        }
      }
    }
    
    return parsed
  }, [])

  const detectColumnsAndParse = useCallback((jsonData, isExcel = false) => {
    let headerRowIndex = -1
    let idColumnIndex = 0
    let nameColumnIndex = 1
    let emailColumnIndex = 2
    
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const row = jsonData[i]
      if (Array.isArray(row)) {
        const rowLower = row.map(cell => String(cell).toLowerCase().trim())
        
        const idCol = rowLower.findIndex(cell => 
          cell === 'id' || cell === 'student id' || cell === 'student_id' || cell.includes('id')
        )
        const nameCol = rowLower.findIndex(cell => 
          cell === 'name' || cell === 'student name' || cell === 'student_name' || cell.includes('name')
        )
        const emailCol = rowLower.findIndex(cell => 
          cell === 'email' || cell.includes('email') || cell.includes('@') || cell.includes('umindanao')
        )
        
        if (idCol >= 0 && nameCol >= 0) {
          headerRowIndex = i
          idColumnIndex = idCol
          nameColumnIndex = nameCol
          emailColumnIndex = emailCol >= 0 ? emailCol : (row.length > 2 ? 2 : -1)
          break
        }
      }
    }
    
    const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0
    const parsed = []
    
    for (let i = startRow; i < jsonData.length; i++) {
      const row = jsonData[i]
      if (!Array.isArray(row)) continue
      
      const id = String(row[idColumnIndex] || '').trim()
      const name = String(row[nameColumnIndex] || '').trim()
      let email = ''
      
      if (emailColumnIndex >= 0 && row.length > emailColumnIndex) {
        email = String(row[emailColumnIndex] || '').trim()
        if ((email.startsWith('"') && email.endsWith('"')) || 
            (email.startsWith("'") && email.endsWith("'"))) {
          email = email.slice(1, -1).trim()
        }
      }
      
      if (email && !email.includes('@')) {
        email = ''
      }
      
      if (id && name) {
        parsed.push({ id, name, email })
      }
    }
    
    return parsed
  }, [])

  const handleFileSelect = useCallback(async (file) => {
    if (!file) return
    
    setCsvFile(file)
    setCsvImportWarnings([])
    
    try {
      const parsed = await parseCSV(file)
      setCsvPreview(parsed)
      if (parsed.length > 0 && onAlert) {
        onAlert('success', 'File Parsed', `Successfully parsed ${parsed.length} student(s).`, false)
      }
    } catch (error) {
      console.error('File parsing error:', error)
      setCsvPreview([])
      if (onAlert) {
        onAlert('error', 'File Error', `Failed to parse file: ${error.message}`, false)
      }
    }
  }, [parseCSV, onAlert])

  const processImport = useCallback(async (csvData, students, enrolls, subjectCode, onSave, onUpdateStudents, onUpdateEnrolls) => {
    setIsImporting(true)
    
    try {
      const warnings = []
      const processedIds = new Set()
      let updatedStudentsList = [...students]
      const updatedEnrolls = JSON.parse(JSON.stringify(enrolls))
      
      Object.keys(updatedEnrolls).forEach(subjectCode => {
        const ids = Array.isArray(updatedEnrolls[subjectCode]) ? updatedEnrolls[subjectCode] : []
        updatedEnrolls[subjectCode] = ids.map(normalizeStudentId).filter(Boolean)
      })
      
      if (!updatedEnrolls[subjectCode]) {
        updatedEnrolls[subjectCode] = []
      }
      
      const idCountMap = new Map()
      csvData.forEach((student, index) => {
        const id = normalizeStudentId((student.id || '').trim())
        if (id) {
          if (idCountMap.has(id)) {
            idCountMap.get(id).push(index)
          } else {
            idCountMap.set(id, [index])
          }
        }
      })
      
      for (const csvStudent of csvData) {
        const id = (csvStudent.id || '').trim()
        const name = (csvStudent.name || '').trim()
        const email = (csvStudent.email || '').trim()
        
        if (!id || !name) continue
        if (!isValidNumericalStudentId(id)) continue
        
        const normalizedId = normalizeStudentId(id)
        if (processedIds.has(normalizedId)) continue
        processedIds.add(normalizedId)
        
        if ((updatedEnrolls[subjectCode] || []).includes(normalizedId)) {
          continue
        }
        
        let studentEmail = email
        if (!studentEmail || !/.+@.+\..+/.test(studentEmail)) {
          studentEmail = generateStudentEmail(name, normalizedId)
        }
        
        let student = updatedStudentsList.find(s => normalizeStudentId(s.id) === normalizedId)
        
        if (!student) {
          student = { 
            id: normalizedId, 
            name, 
            email: studentEmail, 
            archivedSubjects: []
          }
          updatedStudentsList.push(student)
        }
        
        const archivedSubjects = Array.isArray(student.archivedSubjects) ? student.archivedSubjects : []
        if (archivedSubjects.includes(subjectCode)) {
          student.archivedSubjects = archivedSubjects.filter(code => code !== subjectCode)
          updatedStudentsList = updatedStudentsList.map(s => 
            normalizeStudentId(s.id) === normalizedId ? student : s
          )
        }
        
        updatedEnrolls[subjectCode] = [...(updatedEnrolls[subjectCode] || []), normalizedId]
      }
      
      if (onUpdateStudents) {
        onUpdateStudents(updatedStudentsList)
      }
      if (onUpdateEnrolls) {
        onUpdateEnrolls(updatedEnrolls)
      }
      
      if (onImport) {
        await onImport({
          students: updatedStudentsList,
          enrolls: updatedEnrolls,
          warnings
        })
      }
      
      return { success: true, students: updatedStudentsList, enrolls: updatedEnrolls }
    } catch (error) {
      console.error('Import error:', error)
      if (onAlert) {
        onAlert('error', 'Import Failed', error.message, false)
      }
      return { success: false, error: error.message }
    } finally {
      setIsImporting(false)
    }
  }, [onImport, onAlert])

  return {
    csvFile,
    csvPreview,
    csvImportWarnings,
    isImporting,
    handleFileSelect,
    processImport,
    setCsvFile,
    setCsvPreview,
    setCsvImportWarnings,
    setIsImporting
  }
}

