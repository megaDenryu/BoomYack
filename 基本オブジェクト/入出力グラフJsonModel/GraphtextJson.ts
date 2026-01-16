import { FileOperationResult, JSONファイル } from "Extend/FileSystem/ファイル/拡張子付きファイル/JSONファイル";
import { テキスト用グラフ, 付箋text, isテキスト用グラフ_付箋text, Graph } from "../描画キャンバス/配置物グラフ/テキスト化情報";


export class GraphTextJson extends JSONファイル{
    public static readonly 第二拡張子 = "graphtext";
    public constructor(file: File) {
        super(file);
        if (GraphTextJson.第二拡張子抽出(file) !== GraphTextJson.第二拡張子) {
            throw new Error(`ファイルの拡張子が不正です: ${file.name}`);
        }


    }

    public async load(): Promise<FileOperationResult<テキスト用グラフ<付箋text>>>{
        const igraph  = await super.loadAndParse<Graph<付箋text>>(isテキスト用グラフ_付箋text);
        if(igraph.success){
            const graph = テキスト用グラフ.fromGraph<付箋text>(igraph.data, "interface 付箋text{text:string;}");
            return {success:true,data:graph};
        }else{
            return {success:false,error:igraph.error};
        }
    }
}