const {makeDbConnection} = require("./makeDBConnection")
const Lead = require("./anvaya.Lead.mongoose.models")
const Comment = require("./anvaya.Comments.mongoose.model")
const SalesAgent = require("./anvaya.SalesAgent.mongoose.model")
const mongoose = require('mongoose');


const express = require("express")
const app = express()
app.use(express.json())

makeDbConnection()

app.post("/leads", async (req, res) => {
    try{
        const newLead = new Lead(req.body)
        const saveLead = await newLead.save()
        if(saveLead){
            res.status(201).json({message: "Lead added successfully", createdLead: saveLead})
        }
    }catch(error){
        if(error.name = "validationError"){
            return res.status(400).json({
                error: error.message
            })
        }
        res.status(500).json({error: error.message})
    }
})

app.get("/leads", async (req, res) => {
    try{
        const allLeads = await Lead.find()
        if(allLeads.length != 0){
            res.status(200).json(allLeads)
        }else{
            res.status(404).json({error: "Leads not found."})
        }
    }catch(error){
        res.status(500).json({error: error.message})
    }
})

app.post("/leads/:id", async (req, res) => {
    try{
        const updateLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {new: true})
        if(updateLead){
            res.status(200).json({message: "Lead updated successfully", updatedLead: updateLead})
        }else{
            res.status(404).json({error: `Lead with ID ${req.params.id} not found.`})
        }
    }catch(error){
        if(error.name = "validationError"){
            return res.status(400).json({error: error.message})
        }
        res.status(500).json({error: error.message})
    }
})

app.delete("/leads/:id", async (req, res) => {
    try{
        const deleteLead = await Lead.findByIdAndDelete(req.params.id)
        if(deleteLead){
            res.status(200).json("Lead deleted successfully")
        }else{
            res.status(404).json(`Lead with ID ${req.params.id} not found.`)
        }
    }catch(error){
        res.status(500).json({error: error.message})
    }
})

app.post("/agents", async (req, res) => {
    try{
        const newAgent = new SalesAgent(req.body)
        const saveAgent = await newAgent.save()
        if(saveAgent){
            res.status(201).json({message: "new Agent added successfully", newSalesAgent: saveAgent})
        }
    }catch(error){
        if(error.name = "validationError"){
            res.status(400).json({error: error.message})
        }
        res.status(500).json({error: error.message})
    }
})

app.get("/agents", async (req, res) => {
    try{
        const allAgents = await SalesAgent.find()
        if(allAgents.length != 0){
            res.status(200).json(allAgents)
        }else{
            res.status(404).json("agents not found")
        }
    }catch(error){
        res.status(500).json({error: error.message})
    }
})


app.post("/leads/:id/comments", async (req, res) => {
    try{
        const {id} = req.params;
        const {commentText, author} = req.body;

        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({error: "Invalid Lead ID format."})
        }

        const lead = await Lead.findById(id);
        if(!lead){
            return res.status(404).json({error: `Lead with ID ${id} not found.`})
        }

        if(!commentText || typeof commentText !== 'string'){
            return res.status(400).json({error: 'commentText is required and must be a string.'})
        }

        const newComment = new Comment({
            lead: id,
            author: author,
            commentText: commentText
        })

        const saveComment = await newComment.save()
        if(saveComment){
            res.status(201).json({message: "comment saved successfully", comment: saveComment})
        }
    }catch(error){
        res.status(500).json({error: error.message})
    }
})


app.get("/leads/:id/comments", async (req, res) => {
    try{
        const allComments = await Comment.find().populate("author", "name")
        if(allComments.length != 0){
            res.status(200).json(allComments)
        }else{
            res.status(404).json("comments not found")
        }
    }catch(error){
        res.status(500).json({error: error.message})
    }
})

app.get("/report/last-week", async (req, res) => {
    try{
       const today = new Date();
       const sevenDaysAgo = new Date();
       sevenDaysAgo.setDate(today.getDate() - 7)
       
       const closedLeads = await Lead.find({
        status: 'Closed',
        closedAt: {$gte: sevenDaysAgo, $lte: today}
       }).populate('salesAgent', 'name');

       const response = closedLeads.map(lead => ({
        id: lead._id,
        name: lead.name,
        salesAgent: lead.salesAgent?.name,
        closedAt: lead.closedAt
       }));
       if(response){
            res.status(200).json(response)
       }else{
            res.status(404).json({message: "no Leads closed last week"})
       }
    }catch(error){
        res.status(500).json({error: error.message})
    }
})


app.get("/report/pipeline", async (req, res) => {
    try{
        const allLeads = await Lead.find()
        const response = allLeads.reduce((acc, curr) => curr.status !== "Closed" ? acc = acc + 1 : acc, 0)
        res.status(200).json({totalLeadsInPipeline: response})
    }catch(error){
        res.status(500).json({error: error.message})
    }
})

PORT = 3000

app.listen(PORT, () => {
    console.log("server is running on port", PORT)
})
