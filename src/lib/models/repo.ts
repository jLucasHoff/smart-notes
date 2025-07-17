export const initialFiles = (username: string) => {
    const now = new Date().toISOString()
    return [
        {
            path: "structure.json",
            content: JSON.stringify({
                created_at: now,
                updated_at: now,
                owner: username,
            })
        },
        {
            path: 'galleries/.gitkeep',
            content: '# Galleries folder'
        },
        {
            path: 'books/.gitkeep',
            content: '# Books folder'
        },
        {
            path: 'notes/.gitkeep',
            content: '# Notes folder'
        },
        {
            path: 'media/.gitkeep',
            content: '# Medias folder'
        },
    ]
}

