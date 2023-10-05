const express=require("express");
const app=express();
const bodyParser=require("body-parser");
app.use(express.json());
app.use(bodyParser.json());
const axios=require("axios");
const lodash=require("lodash");
require("dotenv").config();
const options={
    method: 'GET',
  headers: {
    'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
  }
}
const url=process.env.URL;
const PORT=process.env.PORT || 4000;
app.listen(4000,(req,res)=>{
    console.log(`Server Started successfully at port number ${PORT}`);
})


const memoizedApiCall=lodash.memoize(async(url,options)=>{
   
    const blogs=await axios.get(url,options);
    const response=blogs.data;
    return response;
   
})

app.get("/api/blogs-stats",async(req,res)=>{
    try{
        let response;
        try{
            const blogs=await memoizedApiCall(url,options);
            response=blogs;
        }
        catch(e){
            return res.status(401).json({
                success:false,
                message:"Error in API call",
            })
        }
        console.log(response);
        const totalBlogs=lodash.size(response.blogs);
        const longestBlogTitle=lodash.maxBy(response.blogs,(blog)=>blog.title.length).title;
        const privacyInTitle=lodash.size(lodash.filter(response.blogs,(d)=>{
            return d.title.includes("privacy")
        }));
        
        const uniqueTitles=lodash.uniqBy(response.blogs,'title');
        return res.status(200).json({
            success:true,
            message:"Blogs fetched successfully",
            totalBlogs,longestBlogTitle,privacyInTitle,uniqueTitles
        })
    }catch(e){
        return res.status(401).json({
            success:false,
            message:"Error in fetching blog stats"+e,
        })
    }
})
app.get("/api/blog-search",async(req,res)=>{
    try{
        let category=req.query.query;
        // console.log(category);
        category=category.toLowerCase();
        let response;
        try{
            const blogs=await memoizedApiCall(url,options);
            response=blogs;
        }
        catch(e){
            return res.status(401).json({
                success:false,
                message:"Error in API call",
            })
        }
        
        console.log(response);
        const findBlogsByCategory=lodash.filter(response.blogs,(d)=>{
            return d.title.toLowerCase().includes(category) ;
        })
        return res.status(200).json({
            success:true,
            message:"Blogs fetched",
            findBlogsByCategory,
        })
        
    }catch(e){
        return res.status(401).json({
            success:false,
            message:"Error in fetching blog stats"+e,
        })
    }
})

