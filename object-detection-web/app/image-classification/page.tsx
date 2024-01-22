"use client";
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import Image from "next/image"
import { ImageIcon, Loader2, ScanSearch } from 'lucide-react'
import React, { useState } from 'react'
import { cn } from '@/lib/utils';
import Link from 'next/link';


type Props = {}

const ImageClassificationPage = (props: Props) => {

    const [url, setUrl] = useState("")
    const [label, setLabel] = useState("")
    const [loading, setLoading ] = useState<boolean>(false)
    const [image, setImage] : any = useState(null)
    var xmin:number = 102
    var ymin:number = 84
    var xmax:number = 172
    var ymax:number = 206
    return (
        <main id="test" className='
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
                <Input id="inp" name="files" type="file"></Input>
                <Button disabled={loading} type="submit">
                    {
                        loading ? (
                            <Loader2 className='animate-spin' />
                        ) : (<ScanSearch size={20} />)
                    }
                </Button>
            </form>
            { url && (<>
                <div className='relative'>
                    <Image src={url} width={400} height={400} alt={'uploaded image'} /> 
                    <svg className='absolute top-0 left-0 w-full h-full z-10 opacity-60' width="400" height="400" viewBox="0 0 400 400" id="draw" xmlns="http://www.w3.org/2000/svg"> 
                        <rect x={xmin} y={ymin} width={xmax-xmin} height={ymax-ymin} className='fill-red-950 stroke-3 stroke-black'></rect>
                    
                    </svg>
                </div>
                <Link className={cn( buttonVariants( { variant: "ghost"}), 'text-xs text-muted-foreground')}
                    href={url}/>
            </>
            )}
            {
                label && <p className='font-bold text-l'>Detected: {label}</p>
            }
            <button onClick={() => {
                var input = document.getElementById("inp");
                console.log(image)

            }}>Testeo puntos</button>
        </main>
    )

    /** Handler functions */
    
    async function uploadFiles (event : any) {
        event.preventDefault()
        const file = event.target[0].files[0]
        console.log(file.size)
        const url = URL.createObjectURL(file)

        const img = new (window as any).Image()
        img.src = url

        img.onload = function () {
            const maxWidth:number   = 400
            const maxHeight:number  = 400
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)
            const width = img.width * ratio + .5 | 0
            const height = img.height * ratio + .5 | 0

            canvas.width = width
            canvas.height = height

            ctx?.drawImage(img, 0, 0, width, height)
            document.body.appendChild(canvas)

            canvas.toBlob(async (blob) => {
                const fr = new FileReader()
                fr.readAsDataURL(blob!)
                const file = new File([blob!], "capture.jpg", {
                    type: 'image/jpeg'
                });
                var fd = new FormData();
                fd.append("files", file);
                setLoading(true)
                const response = await axios.post("/api/detect-objects", fd)
                setLoading(false)

                setUrl(response.data.url)
                setLabel(response.data.label)
            }, 'image/png', 1)
        }

                    /*fetch(dataurl).then(res => res.blob()).then(async blob => {
                        const file = new File([blob], "capture.jpg", {
                            type: 'image/jpg'
                        });
                        var fd = new FormData();
                        fd.append("files", file);
                        setLoading(true)
                        const response = await axios.post("/api/detect-objects", fd)
                        setLoading(false)

                        setUrl(response.data.url)
                        setLabel(response.data.label)
                    })/*

                    

        /** ######################## */
        const formData = new FormData(event.target)
        
        
        /*setLoading(true)
        const response = await axios.post("/api/detect-objects", formData)
        setLoading(false)

        setUrl(response.data.url)
        setLabel(response.data.label)
        */
    }


    

}

export default ImageClassificationPage