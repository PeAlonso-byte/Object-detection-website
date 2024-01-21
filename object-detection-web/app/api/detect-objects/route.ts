import { utapi } from '@/utils/uploadthing'

export async function POST( req: Request, res: Response) {

    const formData = await req.formData()
    const files = formData.getAll('files')
    const response = await utapi.uploadFiles(files)

    const responseData = response[0].data
    const url = responseData?.url

    return new Response("dummy response", {status: 200}) 
}