import { utapi } from '@/utils/uploadthing'
import { pipeline } from '@xenova/transformers';
import { useEffect, useState } from 'react';

export async function POST( req: Request, res: Response) {

    const formData = await req.formData()

    const files = formData.getAll('files')
    const response = await utapi.uploadFiles(files)


    const responseData = response[0].data
    const url = responseData?.url


    /** Detect objects with a local model */

    const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50');
    const output = await detector(url!, {threshold: 0.01, percentage: true});

    console.log(output)

    /** Parse output */

    const dictionaryObjects : { [key: string] : number} = {}
    const boxDictionary : { name: string, coord: any, score:any }[] = []
    output.forEach(({score, label, box} : any) => {
        if (score > 0.85) {
            if (dictionaryObjects[label]) {
                dictionaryObjects[label]++
                
            } else {
                dictionaryObjects[label] = 1
                
                
            }
            boxDictionary.push({name: label, coord:box, score: score}) 
        }
        
    });
    return new Response(JSON.stringify({
        url: url,
        label: JSON.stringify(dictionaryObjects),
        box: JSON.stringify(boxDictionary),
        
    }), {status: 200}) 


}