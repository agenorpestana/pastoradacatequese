
export enum TurmaLevel {
  SEMENTINHA = 'Sementinha',
  ETAPA_1 = '1ª Etapa',
  ETAPA_2 = '2ª Etapa',
  EUCARISTIA_1 = '1ª Eucaristia',
  PERSEVERANCA = 'Perseverança',
  CRISMA_1 = 'Crisma 1ª Etapa',
  CRISMA_2 = 'Crisma 2ª Etapa',
  CATECUMENATO = 'Catecumenato',
  ADULTOS = 'Catequese de Adultos'
}

export interface ParishConfig {
  logo?: string;
  pastoralName: string;
  parishName: string;
  dioceseName: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  facebook?: string;
  website?: string;
}

export interface UserPermissions {
  dashboard: boolean;
  students_view: boolean;
  students_create: boolean;
  students_edit: boolean;
  students_delete: boolean;
  students_print: boolean;
  students_confirmed_view: boolean;
  students_confirmed_manage: boolean;
  classes: boolean;
  catequistas: boolean;
  formations: boolean;
  reports: boolean;
  attendance_report: boolean;
  certificates: boolean;
  attendance: boolean;
  users_management: boolean;
  library_view: boolean;
  library_upload: boolean;
  library_delete: boolean;
  gallery_view: boolean;
  gallery_upload: boolean;
  gallery_delete: boolean;
  allowedClassIds?: string[];
}

export type UserRole = 'coordenador_paroquial' | 'coordenador_comunidade' | 'catequista' | 'catequista_auxiliar';

export interface User {
  id: string;
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  permissions: UserPermissions;
  linkedCatequistaId?: string; // ID do perfil de catequista vinculado
}

export interface Turma {
  id: string;
  nome: string;
  nivel: TurmaLevel | string;
  catequista: string;
  diaSemana: string;
  horario: string;
  ano: string;
  ativa: boolean;
  comunidade?: string;
}

export interface AttendanceEntry {
  studentId: string;
  status: 'present' | 'absent';
}

export interface AttendanceSession {
  id: string;
  turmaId: string;
  date: string;
  tema?: string;
  entries: AttendanceEntry[];
}

export interface FormationEvent {
  id: string;
  tema: string;
  inicio: string; 
  fim: string;    
  presentes: string[]; 
}

export interface ParishEvent {
  id: string;
  titulo: string;
  dataInicio: string;
  horarioInicio: string;
  dataFim: string;
  horarioFim: string;
  local: string;
  tipo: 'Formação' | 'Reunião' | 'Celebração' | 'Retiro' | 'Outros';
  tipoCustomizado?: string;
  presentes?: string[];
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  date: string;
  turmaId?: string;
}

export interface LibraryFile {
  id: string;
  name: string;
  category: 'Livro' | 'Revista' | 'Apostila' | 'Calendário' | 'Roteiro' | 'Planejamento' | 'Outros';
  url: string;
  type: string;
  uploadDate: string;
}

export interface PersonBasic {
  nome: string;
  telefone: string;
  rg?: string;
  cpf?: string;
}

export interface PersonFull extends PersonBasic {
  estadoCivil: string;
  naturalidade: string;
  ufNaturalidade: string;
  whatsapp: string;
  email: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  ufEndereco: string;
  rgCpf: string;
  cep: string;
}

export interface Catequista {
  id: string;
  nome: string;
  foto?: string;
  matricula?: string;
  status: 'Ativo' | 'Inativo';
  sexo: 'M' | 'F';
  dataNascimento: string;
  rgCpf: string;
  estadoCivil: string;
  conjuge?: string;
  conjugeRgCpf?: string;
  conjugeTelefone?: string;
  naturalidade: string;
  ufNaturalidade: string;
  comunidade: string;
  desde: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  ufEndereco: string;
  cep: string;
}

export interface StudentDocument {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  dataUpload: string;
}

export interface Student {
  id: string;
  matricula: string;
  nomeCompleto: string;
  foto?: string;
  novoCatequizando: boolean;
  status: 'Ativo' | 'Inativo' | 'Concluido';
  sexo: 'M' | 'F';
  estadoCivil?: string;
  dataNascimento: string;
  rgCpf: string;
  naturalidade: string;
  ufNaturalidade: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  ufEndereco: string;
  cep: string;
  moroCom: 'Meus Pais' | 'Minha Mãe' | 'Meu Pai' | 'Meus Avós' | 'Outros';
  telefone: string;
  whatsapp: string;
  email: string;
  batizado: boolean;
  batismoDiocese?: string;
  batismoUF?: string;
  batismoParoquia?: string;
  batismoComunidade?: string;
  batismoLocal?: string;
  batismoData?: string;
  batismoCelebrante?: string;
  fezPrimeiraEucaristia: boolean;
  eucaristiaDiocese?: string;
  eucaristiaParoquia?: string;
  eucaristiaComunidade?: string;
  eucaristiaLocal?: string;
  eucaristiaData?: string;
  eucaristiaUF?: string;
  eucaristiaCelebrante?: string;
  eucaristiaCatequistas?: string;
  pai: Partial<PersonFull>;
  mae: Partial<PersonFull>;
  padrinhoBatismo: Partial<PersonFull>;
  madrinhaBatismo: Partial<PersonFull>;
  celebrante?: string;
  localCelebracao?: string;
  dataCelebracao?: string;
  livro?: string;
  folha?: string;
  numeroRegistro?: string;
  observacoes?: string;
  padrinhoCrisma: Partial<PersonFull>;
  inicioPreparacao: string;
  fimPreparacao: string;
  comunidade: string;
  turma: string;
  catequistas: string;
  dataCadastro: string;
  documentos?: StudentDocument[];
}

export type AppView = 'dashboard' | 'register' | 'list' | 'classes_list' | 'classes_create' | 'catequista_list' | 'catequista_create' | 'formation_list' | 'formation_create' | 'reports' | 'attendance_report' | 'certificates' | 'attendance_quick' | 'profile' | 'users_list' | 'users_create' | 'gallery' | 'library' | 'config';
