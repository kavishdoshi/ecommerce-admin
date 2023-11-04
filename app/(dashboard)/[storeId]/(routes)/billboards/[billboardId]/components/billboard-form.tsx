"use client";

import * as z from "zod";
import axios from "axios";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";


import { Billboard } from "@prisma/client";
import {Heading} from "@/components/ui/heading";
import {Button} from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModel } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";






interface BillboardFormProps {
    intialData: Billboard | null;
}

const formSchema = z.object({
    label:z.string().min(1),
    imageUrl:z.string().min(1),
});

type BillboardFormValues = z.infer<typeof formSchema>;

export const BillboardForm: React.FC<BillboardFormProps> = ({
    intialData
}) => {
    const params = useParams();
    const router = useRouter();

    const title = intialData ? "Edit Billboard" : "Add New Billboard";
    const description = intialData ? "Edit your billboard" : "Add a new billboard to your store";
    const toastMessage = intialData ? "Billboard updated!" : "Billboard created!";
    const actions = intialData ? "Save Changes" : "Create Billboard";

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: intialData || {
            label : '', 
            imageUrl: '',
        }
    });

    const onSubmit = async (data: BillboardFormValues) => {
        try {
            setLoading(true);
            if (intialData) {
                await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data);
            } else
            {
                await axios.post(`/api/${params.storeId}/billboards`, data);
            }
            
            router.refresh();
            router.push(`/${params.storeId}/billboards`);
            toast.success(toastMessage);
        } catch (error) {
            toast.error("Something went wrong!")
        } finally {
            setLoading(false);
        }
    }

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`);
            router.refresh();
            router.push("/");
            toast.success("Billboard deleted!");
        } catch (error) {
            toast.error("Make sure that you delete all categories first which use this billboard!")
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }

    return (
        <>
            <AlertModel isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading}/>
            <div className="flex items-center justify-between">
                <Heading title={title} description={description}/>
                { intialData && (
                    <Button disabled={loading} variant="destructive" size="icon" onClick={()=> setOpen(true)}><Trash className="h-4 w-4" /></Button>
                )}
                
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <FormField 
                            control={form.control} 
                            name="imageUrl"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel> Background Image </FormLabel>
                                        <FormControl>
                                            <ImageUpload 
                                                value={field.value ? [field.value]: []}
                                                disabled={loading}
                                                onChange={(url) => field.onChange(url)}
                                                onRemove={(url) => field.onChange("")}/>
                                        </FormControl>
                                        <FormMessage />
                                </FormItem>
                            )}/>
                    <div className="grid grid-cols-3 gap-8">
                        <FormField 
                            control={form.control} 
                            name="label"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel> Label </FormLabel>
                                        <FormControl>
                                            <Input 
                                                disabled={loading} placeholder="Billboard Label" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                </FormItem>
                            )}/>
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">{actions}</Button>
                </form>
            </Form>
            <Separator />
        </>
    );
}