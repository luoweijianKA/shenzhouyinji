import axios from 'axios';

interface UploadOptions {
    preview?: boolean;
    tag?: string;
}

interface UploadedFile {
    name: string;
    rawUri: string;
    previewUri: string;
    uri: string;
}

interface UploadResponse {
    file: UploadedFile;
    success: boolean;
    message?: string;
}

/**
 * 文件上传工具类
 */
class FileUploader {
    private static readonly UPLOAD_URL = 'https://fuwu.shenzhouyinji.cn/upload';
    private static readonly DEFAULT_OPTIONS: UploadOptions = {
        preview: true,
        tag: 'icon'
    };

    /**
     * 上传文件
     * @param file 要上传的文件
     * @param options 上传选项
     * @returns 上传结果
     */
    public static async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResponse> {
        try {
            const formData = new FormData();
            const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };

            // 添加文件
            formData.append('file', file);
            
            // 添加其他参数
            Object.entries(mergedOptions).forEach(([key, value]) => {
                formData.append(key, value.toString());
            });

            const response = await axios.post(this.UPLOAD_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'User-Agent': 'PostmanRuntime-ApipostRuntime/1.1.0'
                }
            });

            // 根据文件类型选择使用哪个 URI
            const isImage = file.type.startsWith('image/');
            const uri = isImage && response.data.file.previewUri 
                ? response.data.file.previewUri 
                : response.data.file.rawUri;

            return {
                file: {
                    ...response.data.file,
                    uri
                },
                success: true
            };
        } catch (error) {
            console.error('File upload failed:', error);
            return {
                file: {
                    name: '',
                    rawUri: '',
                    previewUri: '',
                    uri: ''
                },
                success: false,
                message: error instanceof Error ? error.message : 'Upload failed'
            };
        }
    }

    /**
     * 批量上传文件
     * @param files 要上传的文件数组
     * @param options 上传选项
     * @returns 上传结果数组
     */
    public static async uploadFiles(files: File[], options: UploadOptions = {}): Promise<UploadResponse[]> {
        const uploadPromises = files.map(file => this.uploadFile(file, options));
        return Promise.all(uploadPromises);
    }
}

export default FileUploader; 