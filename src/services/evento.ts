const API_URL = 'http://localhost:3001/evento-deteccion';

export async function getEventos() {
  const res = await fetch(API_URL);
  return res.json();
}

export async function createEvento(evento:any) {
  console.log(evento);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evento),
  });
  return res.json();
}

export async function updateEvento(id:any, evento:any) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evento),
  });
  return res.json();
}

export async function deleteevento(id:any) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}
