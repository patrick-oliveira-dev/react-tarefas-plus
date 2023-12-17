import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./styles.module.css";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { db } from "../../services/firebaseConnection";
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc
} from "firebase/firestore";
import TextArea from "@/components/textarea";
import { FaTrash } from "react-icons/fa";

interface TaskProps {
  item: {
    task: string;
    public: boolean;
    user: string;
    created: string;
    taskId: string;
  };
  allComments: CommentProps[];
}

interface CommentProps {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}

const Task = ({ item, allComments }: TaskProps) => {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<CommentProps[]>(allComments || []);

  async function handleComment(event: FormEvent) {
    event.preventDefault();

    if (input === "") return;

    if (!session?.user?.email || !session?.user?.name) return;

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session.user?.name,
        taskId: item?.taskId,
      });

      const data = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId
      }

      setComments((oldItems) => [...oldItems, data])

      setInput("");
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDeleteComment(id: string) {
    try {
        const docRef = doc(db, "comments", id)
        await deleteDoc(docRef)

        const commentsWithoutDeletedComment = comments.filter((item) => item.id !== id )
        setComments(commentsWithoutDeletedComment)
    } catch (error) {
        console.log(error)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da Tarefa</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <p>{item?.task}</p>
        </article>
      </main>

      <section className={styles.commentsContainer}>
        <h2>Faça um comentário</h2>

        <form onSubmit={handleComment}>
          <TextArea
            placeholder="Digite seu comentário..."
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(event.target.value)
            }
          />
          <button className={styles.button} disabled={!session?.user}>
            Enviar comentario
          </button>
        </form>
      </section>

      <section className={styles.commentsContainer}>
        <h2>Comentários</h2>
        {comments.length === 0 && (
          <span>Nenhum comentário foi encontrado...</span>
        )}

        {comments.map((item) => (
          <article key={item.id} className={styles.comment}>
            <div className={styles.headComment}>
              <label className={styles.userNameLabel}>{item.name}</label>
              {item.user === session?.user?.email && (
                <button className={styles.buttonTrash} onClick={()=> handleDeleteComment(item.id)}>
                  <FaTrash size={18} color="#EA3140" />
                </button>
              )}
            </div>
            <p>{item.comment}</p>
          </article>
        ))}
      </section>

    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;
  const docRef = doc(db, "tarefas", id);

  //Busca todos os comentarios da tarefa
  const q = query(collection(db, "comments"), where("taskId", "==", id));
  const snapshotComments = await getDocs(q);

  let allComments: CommentProps[] = [];

  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId,
    });
  });

  console.log(allComments);

  const snapshot = await getDoc(docRef);

  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const miliseconds = snapshot.data()?.created?.seconds * 1000;

  const task = {
    task: snapshot.data()?.task,
    public: snapshot.data()?.public,
    user: snapshot.data()?.user,
    created: new Date(miliseconds).toLocaleDateString(),
    taskId: id,
  };

  return {
    props: {
      item: task,
      allComments: allComments,
    },
  };
};

export default Task;
