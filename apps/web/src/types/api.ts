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

export interface ProjectMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
}

export interface FolderMember {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

export interface FolderFormData {
  name: string;
}


export interface CreateFileInput {
  name: string;
  content?: string;
  folderId: string;
}

export interface UpdateFileInput {
  id: string;
  name?: string;
  content?: string;
  folderId?: string;
}

export interface File {
  id: string;
  name: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  folderId: string;
}
