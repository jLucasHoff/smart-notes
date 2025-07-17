interface INoteNode {
    id: string,
    name: string,
    contentPath: string,
    created_at: string,
    updated_at: string,
}

interface IBaseNode {
    name: string,
    descPath: string
}

interface IBookNode extends IBaseNode {
    notes?: INoteNode[]
}

interface IGalleryNode extends IBaseNode {
    books?: IBookNode[]
}

export interface IStructureRepo {
    created_at: string,
    updated_at: string,
    owner: string,
    galleries?: IGalleryNode[]
}