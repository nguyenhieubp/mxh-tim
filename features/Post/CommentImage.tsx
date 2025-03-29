import Image from "next/image";

const CommentImage = () => {
    return (
        <div className="w-[40rem] h-full">
            <Image
                width={100}
                height={100}
                objectFit="cover"
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1527549993586-dff825b37782?auto=format&fit=crop&w=286"
                alt="comment"
            />
        </div>
    );
}

export default CommentImage; 