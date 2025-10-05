export interface ProjectFile {
  id: string;
  name: string;
  content?: string;
  projectId: string | null;
}

export interface ProjectFolder {
  id: string;
  name: string;
  projectId: string | null;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  files?: ProjectFile[];
  folders?: ProjectFolder[];
}

export interface ProjectFormData {
  name: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  projectId: string | null;
  parentId: string | null;
  children?: Folder[];
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean | null;
  image: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderInput {
  name: string;
  projectId: string;
  parentId?: string;
}

export interface UpdateFolderInput {
  id: string;
  name?: string;
  parentId?: string;
}
