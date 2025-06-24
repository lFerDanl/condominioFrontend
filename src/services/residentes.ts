export type Vivienda = {
    id: number;
    numero: string;
    bloque: string;
    zona: string;
  };
  
  export type Residente = {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    viviendaId: number;
    vivienda: Vivienda;
    telefono?: string;
    email?: string;
    fecha_nacimiento?: string;
    fecha_registro?: string;
    foto_registrada?: boolean;
  };

  export type AccesoResidente = {
    id: number;
    residenteId: number;
    residente: Residente;
    fecha_hora: string;
    tipo_acceso: 'ENTRADA' | 'SALIDA';
    ubicacion?: string;
  };

  export type CreateResidenteData = Omit<Residente, 'id' | 'fecha_registro'>;
  export type UpdateResidenteData = Partial<Omit<Residente, 'id' | 'fecha_registro'>>;
  
  export async function getResidentes(): Promise<Residente[]> {
    try {
      // Asegúrate de que la URL base de la API sea correcta.
      // Puede que necesites configurarla en una variable de entorno.
      const response = await fetch('http://localhost:3001/residente');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener los residentes:", error);
      // En un caso real, podrías manejar este error de una forma más elegante.
      return [];
    }
  }

  export async function getResidente(id: number): Promise<Residente | null> {
    try {
      const response = await fetch(`http://localhost:3001/residente/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener el residente:", error);
      return null;
    }
  }

  export async function getAccesosResidente(residenteId: number): Promise<AccesoResidente[]> {
    try {
      const response = await fetch(`http://localhost:3001/residente/${residenteId}/accesos`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener accesos del residente:", error);
      return [];
    }
  }

  export async function getAccesosPorFecha(fechaInicio: string, fechaFin: string): Promise<AccesoResidente[]> {
    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFin
      });
      
      const response = await fetch(`http://localhost:3001/residente/accesos/por-fecha?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener accesos por fecha:", error);
      return [];
    }
  }

  export async function getEstadisticasAccesos(): Promise<any> {
    try {
      const response = await fetch('http://localhost:3001/residente/accesos/estadisticas');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener estadísticas de accesos:", error);
      return null;
    }
  }

  export async function registrarAccesoResidente(accesoData: {
    residenteId: number;
    tipo_acceso: 'ENTRADA' | 'SALIDA';
    ubicacion?: string;
  }): Promise<AccesoResidente | null> {
    try {
      const response = await fetch('http://localhost:3001/residente/acceso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accesoData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al registrar acceso del residente:", error);
      return null;
    }
  }

  export async function createResidente(residenteData: CreateResidenteData): Promise<Residente | null> {
    try {
      const response = await fetch('http://localhost:3001/residente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(residenteData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al crear el residente:", error);
      return null;
    }
  }

  export async function updateResidente(id: number, residenteData: UpdateResidenteData): Promise<Residente | null> {
    try {
      const response = await fetch(`http://localhost:3001/residente/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(residenteData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al actualizar el residente:", error);
      return null;
    }
  }

  export async function deleteResidente(id: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:3001/residente/${id}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error("Error al eliminar el residente:", error);
      return false;
    }
  } 


  export async function createVivienda(viviendaData: Vivienda): Promise<Vivienda | null> {
    try {
      const response = await fetch('http://localhost:3001/viviendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(viviendaData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;      
    } catch (error) {
      console.error("Error al crear la vivienda:", error);
      return null;
    }
  }

  export async function updateVivienda(id: number, viviendaData: Vivienda): Promise<Vivienda | null> {
    try {
      const response = await fetch(`http://localhost:3001/viviendas/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(viviendaData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al actualizar la vivienda:", error);   
      return null;
    }
  }

  export async function deleteVivienda(id: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:3001/viviendas/${id}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error("Error al eliminar la vivienda:", error);
      return false;
    }
  }

  export async function getViviendas(): Promise<Vivienda[]> {   
    try {
      const response = await fetch('http://localhost:3001/viviendas');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener las viviendas:", error);  
      return [];
    }
  }

  export async function getVivienda(id: number): Promise<Vivienda | null> {
    try {
      const response = await fetch(`http://localhost:3001/viviendas/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener la vivienda:", error);
      return null;
    }
  }