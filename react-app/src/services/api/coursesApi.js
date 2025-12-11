// API service for courses - replaces Firestore calls
import apiClient from './apiClient'

export async function getCourseById(id) {
  try {
    const course = await apiClient.get(`/courses/${id}`)
    return course
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return null
    }
    throw error
  }
}

export async function getCourseByCode(code, professorId = null) {
  try {
    // Encode the code for the URL path (handles spaces)
    const encodedCode = encodeURIComponent(code)
    let url = `/courses/code/${encodedCode}`
    
    // Add professorId as query parameter if provided
    if (professorId) {
      url += `?professorId=${professorId}`
    }
    
    const course = await apiClient.get(url)
    return course
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return null
    }
    throw error
  }
}

export async function getCoursesByProfessor(professorId) {
  return apiClient.get(`/courses/professor/${professorId}`)
}

export async function createCourse(data) {
  return apiClient.post('/courses', {
    code: data.code,
    name: data.name,
    credits: data.credits || 0,
    professorId: data.professorId || data.professor_id
  })
}

export async function updateCourse(id, data) {
  return apiClient.put(`/courses/${id}`, {
    code: data.code,
    name: data.name,
    credits: data.credits,
    professorId: data.professorId || data.professor_id
  })
}

export async function deleteCourse(id) {
  return apiClient.delete(`/courses/${id}`)
}

