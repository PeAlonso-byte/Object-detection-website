"use client";
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { ImageIcon, Loader2, ScanSearch } from 'lucide-react'
import React, { useState } from 'react'


type Props = {}

const ImageClassificationPage = (props: Props) => {

    const [url, setUrl] = useState("")
    const [label, setLabel] = useState("")
    const [loading, setLoading ] = useState<boolean>(false)

    return (
        <main className='
        flex
        flex-col
        items-center
        justify-start
        p-24
        gap-2'
        >
            <form className='
            flex
            gap-2
            items-center'
            onSubmit={uploadFiles} >
                <ImageIcon />
                <Input name="files" type="file"></Input>
                <Button disabled={loading} type="submit">
                    {
                        loading ? (
                            <Loader2 className='animate-spin' />
                        ) : (<ScanSearch size={20} />)
                    }
                </Button>
            </form>
        </main>
    )

    /** Handler functions */

    async function uploadFiles (event : any) {
        event.preventDefault()
        const formData = new FormData(event.target)
        setLoading(true)
        const response = await axios.post("/api/classify-image", formData)
        setLoading(false)
    }
}

export default ImageClassificationPage