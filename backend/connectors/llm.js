
//now make a call to the chagpt 

export async function askllm(prompt){
    //take the key 
    const response =await fetch("https://api.openai.com/v1/chat/completions",{
    //Post the request :Headers+ body '
    method :"POST" , 
    headers:{
     "Authorization" : `Bearer ${process.env.OPENAI_API_KEY}`,
     "Content- Type": "application/json"
     },
    
    body: JSON.stringify({
        model:"gpt-4.1-mini",
        messages :[
            {
                role:"user",content :prompt
             }
            ]
    })
        
    }
    )
//taking back the response 
const data =await response.json()
data.choices[0].message.content
}