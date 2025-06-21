export type Empleado = {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    ci: string;
    telefono?: string;
    email?: string;
    fecha_nacimiento?: string;
    fecha_contratacion: string;
    cargo: string;
    departamento: string;
    salario?: number;
    horario_entrada?: string;
    horario_salida?: string;
    dias_trabajo?: string;
    estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'DESPEDIDO' | 'VACACIONES';
    foto_registrada: boolean;
    observaciones?: string;
    fecha_actualizacion: string;
  };
  
  export type AccesoEmpleado = {
    id: number;
    empleadoId: number;
    empleado: Empleado;
    fecha_hora: string;
    tipo_acceso: 'ENTRADA' | 'SALIDA';
    ubicacion?: string;
  };

  export type CreateEmpleadoData = Omit<Empleado, 'id' | 'fecha_contratacion' | 'fecha_actualizacion'>;
  export type UpdateEmpleadoData = Partial<Omit<Empleado, 'id' | 'fecha_contratacion' | 'fecha_actualizacion'>>;
  
  export async function getEmpleados(): Promise<Empleado[]> {
    try {
      const response = await fetch('http://localhost:3001/empleado');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener los empleados:", error);
      return [];
    }
  }

  export async function getEmpleadosActivos(): Promise<Empleado[]> {
    try {
      const response = await fetch('http://localhost:3001/empleado/activos');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener empleados activos:", error);
      return [];
    }
  }

  export async function getEmpleadosPorDepartamento(departamento: string): Promise<Empleado[]> {
    try {
      const response = await fetch(`http://localhost:3001/empleado/departamento/${encodeURIComponent(departamento)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener empleados por departamento:", error);
      return [];
    }
  }

  export async function getEmpleado(id: number): Promise<Empleado | null> {
    try {
      const response = await fetch(`http://localhost:3001/empleado/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener empleado:", error);
      return null;
    }
  }

  export async function getAccesosEmpleado(empleadoId: number): Promise<AccesoEmpleado[]> {
    try {
      const response = await fetch(`http://localhost:3001/empleado/${empleadoId}/accesos`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener accesos del empleado:", error);
      return [];
    }
  }

  export async function getAccesosPorFecha(fechaInicio: string, fechaFin: string): Promise<AccesoEmpleado[]> {
    try {
      const params = new URLSearchParams({
        fechaInicio,
        fechaFin
      });
      
      const response = await fetch(`http://localhost:3001/empleado/accesos/por-fecha?${params}`);
      
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
      const response = await fetch('http://localhost:3001/empleado/accesos/estadisticas');
      
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

  export async function registrarAccesoEmpleado(accesoData: {
    empleadoId: number;
    tipo_acceso: 'ENTRADA' | 'SALIDA';
    ubicacion?: string;
  }): Promise<AccesoEmpleado | null> {
    try {
      const response = await fetch('http://localhost:3001/empleado/acceso', {
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
      console.error("Error al registrar acceso del empleado:", error);
      return null;
    }
  }
  
  export async function createEmpleado(empleado: CreateEmpleadoData): Promise<Empleado | null> {
    try {
      const response = await fetch('http://localhost:3001/empleado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empleado),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al crear empleado:", error);
      return null;
    }
  }
  
  export async function updateEmpleado(id: number, empleado: UpdateEmpleadoData): Promise<Empleado | null> {
    try {
      const response = await fetch(`http://localhost:3001/empleado/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empleado),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      return null;
    }
  }
  
  export async function deleteEmpleado(id: number): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:3001/empleado/${id}`, {
        method: 'DELETE',
      });
  
      return response.ok;
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      return false;
    }
  }
  
