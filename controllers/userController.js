import asyncHandler from 'express-async-handler'

import { prisma } from '../config/prismaConfig.js'

export const createUser= asyncHandler(async (req, res)=>{
    console.log("creating a user");
    let { email }= req.body;

    const userExists=await prisma.user.findUnique({
        where:{ email: email}
    });
    
    if(!userExists){
        const user=await prisma.user.create({
            data: req.body
        });
        res.send({
            message:"User registered successfully",
            user:user,
        });
    }
    else res.status(201).send({
        message: "User already registered" });
});


//function to book a visit to resd
export const bookVisit=asyncHandler(async(req,res)=>{
    const{email, date}=req.body;
    const{ id }=req.params;

    try{
        const alreadyBooked= await prisma.user.findUnique({
            where:{email},
            select: {bookedVisit: true},
        });

        if(alreadyBooked.bookedVisit.some((visit)=>visit.id===id))
        {
            res
            .status(400)
            .json({message:"This residency is already booked by you."});
        }
        else{
            await prisma.user.update({
                where:{ email: email},
                data:{
                    bookedVisit: { push: { id, date}},
                },
            });
            res.send("your visit is booked successfully")
        }
    }
    catch(err){
        throw new Error(err.message)
    }
});

//function to get all booking of user
export const getAllBookings=asyncHandler(async(req,res)=>{
    const { email }=req.body

    try{
        const bookings=await prisma.user.findUnique({
            where:{email},
            select:{ bookedVisit: true},
        });
        res.status(200).send(bookings);
    }
    catch(err){
        throw new Error(err.message);
    }
})

//function to cancel the booking
export const cancelBooking=asyncHandler(async(req,res)=>{
    const{ email }=req.body;
    const{ id }=req.params;
    try{
        const user=await prisma.user.findUnique({
            where: { email: email},
            select: { bookedVisit: true},
        });
        const index=user.bookedVisit.findIndex((visit)=> visit.id===id)

        if(index ===-1){
            res.status(404).json({message:"Booking not found"})
        }
        else{
            user.bookedVisit.splice(index, 1)
            await prisma.user.update({
                where:{ email },
                data:{
                    bookedVisit: user.bookedVisit,
                },
            });
            res.send("Booking cancelled successfully")
        }
    }
    catch (err){
        throw new Error(err.message);
    }
});

//function to add a resd in favourite list of a user
export const toFav=asyncHandler(async(req,res)=>{
    const { email }=req.body;
    const { rid }=req.params;

    try{
        const user=await prisma.user.findUnique({
            where:{ email },
        })
        if(user.favResidenciesID.includes(rid))
        {
            const updateUser=await prisma.user.update({
                where:{ email },
                data:{
                    favResidenciesID:{
                        set: user.favResidenciesID.filter((id)=>id!==rid),
                    },
                },
            });
            res.send({ message: "Removed from Favorites",user:updateUser});
        }
        else{
            const updateUser=await prisma.user.update({
                where:{ email },
                data:{
                    favResidenciesID:{
                        push:rid,
                    },
                },
            });
            res.send({ message: "updated Favorites", user: updateUser});
        }
    }
    catch(err){
        throw new Error(err.message)
    }
});

//unction to get all favourites
export const getAllFav=asyncHandler(async(req,res)=>{
    const { email } = req.body;
    try{
        const favResd = await prisma.user.findUnique({
            where: { email },
            select: { favResidenciesID: true}
        });
        res.status(200).send(favResd);
    }
    catch(err){
        throw new Error(err.message);
    }
});