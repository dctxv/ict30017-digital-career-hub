const API_URL = 'http://localhost:3000/api';

export const getDisciplines = async () => {
  const response = await fetch(`${API_URL}/disciplines`);
  if (!response.ok) throw new Error('Failed to fetch disciplines');
  return response.json();
};

export const getDisciplineById = async (id) => {
  const response = await fetch(`${API_URL}/disciplines/${id}`);
  if (!response.ok) throw new Error('Failed to fetch discipline');
  return response.json();
};

export const createDiscipline = async (name, description) => {
  const response = await fetch(`${API_URL}/disciplines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description })
  });
  if (!response.ok) throw new Error('Failed to create discipline');
  return response.json();
};

export const updateDiscipline = async (id, name, description) => {
  const response = await fetch(`${API_URL}/disciplines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description })
  });
  if (!response.ok) throw new Error('Failed to update discipline');
  return response.json();
};

export const deleteDiscipline = async (id) => {
  const response = await fetch(`${API_URL}/disciplines/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete discipline');
  return response.json();
};