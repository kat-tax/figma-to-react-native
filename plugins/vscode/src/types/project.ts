export interface Project {
	name: string;
	path: string;
	targetPath: string;
	outputType: string;
	designerHostPath: string;
	targetFramework: string;
	depsFilePath: string;
	runtimeConfigFilePath: string;
	projectReferences: string[];
	directoryPath: string;
}

export interface File {
	path: string;
	targetPath: string;
	projectPath: string;
}

export interface Solution {
	solution: string;
	projects: Project[];
	files: File[];
}
