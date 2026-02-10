// Accesing the REQUEST **select repo**
import {Request,Response} from "express" ;
import {execFile} from "child_process";
import path from "path"
import { SAFE_ROOT } from "./tsconfig.json";
import express from "express";
const app = express();
import {promises as fs} from "fs";
const SAFE_ROOT="your/safe/root";

type RepoResult = {
    name: string;
    isGitRepo: boolean;
}

app.get("/check", async (req:Request, res:Response):Promise<Response> => {
    try {
        const querypath=req.query.path 
        if (typeof querypath!=="string") {
            return res.status(400).send("Path required")
        }

        const userPath = path.resolve(querypath)

        if (!userPath.startsWith(SAFE_ROOT)) {
            return res.status(403).send("Access denied")
        }

        const stats = await fs.stat(userPath)
        if (!stats.isDirectory()) {
            return res.status(400).send("Invalid Directory")
        }

        const items = await fs.readdir(userPath)
        const results:RepoResult[] = []
        await Promise.all(items.map(async (item:string ) => {
            const fullPath:string = path.join(userPath, item)
           try{ const itemStats = await fs.stat(fullPath)
                if (!itemStats.isDirectory()) return
           }
           catch {
                return // safely ignore fs errors
               }
            return new Promise<void>((resolve) => {
                execFile(
                    "git",
                    ["rev-parse", "--show-toplevel"],
                    { cwd: fullPath, timeout: 5000 },
                    (err, stdout) => {
                        if (!err && stdout.trim() === "true") {
                            results.push({ name: item, isGitRepo: true })
                        }
                        resolve()
                    }
                )
            })
        }))

        return res.json(results)

    } catch (err:unknown) {
        if(err instanceof Error){
        console.error(err.message)
        return res.status(500).send(err.message)
    }
      return res.status(500).send("Unknown error occurred"); 
}
    })
