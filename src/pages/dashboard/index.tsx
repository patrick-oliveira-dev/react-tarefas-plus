import { GetServerSideProps, GetStaticProps } from "next"
import { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import Link from 'next/link'
import Head from "next/head"
import styles from "./styles.module.css"
import TextArea from "@/components/textarea"

import { getSession } from "next-auth/react"
import {FiShare2} from 'react-icons/fi'
import {FaTrash} from 'react-icons/fa'

import {db} from '../../services/firebaseConnection'
import {addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc} from 'firebase/firestore'

interface HomeProps {
    user: {
        email: string
    }
}

interface TaskProps {
    id: string
    created: Date
    public: boolean
    task: string
    user: string
}

export default function Dashboard({user}: HomeProps) {

    const [input, setInput] = useState("")
    const [publicTask, setPublicTask] = useState(false)
    const [tasks, setTasks] = useState<TaskProps[]>([])

    useEffect(() => {
        async function loadTasks() {
            const taskRef = collection(db, "tarefas")
            const q = query(
                taskRef, orderBy("created", "desc"),
                where("user", "==", user?.email)
            )

            onSnapshot(q, (snapshot) => {
                let list = [] as TaskProps[]

                snapshot.forEach((doc) => {
                    list.push({
                        id: doc.id,
                        created: doc.data().created,
                        public: doc.data().public,
                        task: doc.data().task,
                        user: doc.data().user

                    })
                })
                setTasks(list)
            })

        }

        loadTasks()
    }, [user?.email])

    function handleChangePublic(event:ChangeEvent<HTMLInputElement>) {
        setPublicTask(event.target.checked)
    }

    async function handleRegisterTask(event:FormEvent) {
        event.preventDefault();

        if (input === "") return

        try {
            await addDoc(collection(db, "tarefas"), {
                task: input,
                created: new Date(),
                user: user?.email,
                public: publicTask

            })

            setInput("")
            setPublicTask(false)

        } catch (err) {
            console.log(err)
        }
    }

    async function handleShare(id:string) {
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        )
    }

    async function handleDeleteTask(id:string) {
        const docRef = doc(db, "tarefas", id)
        await deleteDoc(docRef)
    }

    return (
        <div className={styles.container}>

            <Head>
                <title>Meu painel de tarefas</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>
                            Digite a tarefa
                        </h1>

                        <form onSubmit={handleRegisterTask}>
                            <TextArea
                                placeholder="Digite qual sua tarefa..."
                                value={input}
                                onChange={(event:ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                            />
                            <div className={styles.checkboxArea}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChangePublic}
                                />
                                <label>Deixar tarefa publica?</label>
                            </div>
                            <button type="submit" className={styles.button}>
                                Registrar
                            </button>
                        </form>
                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <h1>Minhas Tarefas</h1>

                    {tasks.map((item) => (
                        <article key={item.id} className={styles.task}>
                        
                        {item.public && (
                            <div className={styles.tagContainer}>
                            <label className={styles.tag}>Publico</label>
                            <button className={styles.shareButton} onClick={ ()=> handleShare(item.id)}>
                                <FiShare2
                                    size={22}
                                />
                            </button>
                        </div>
                        )}

                        <div className={styles.taskContent}>
                            {item.public ? (
                                <Link  href={`/task/${item.id}`}>
                                    <p>{item.task}</p>
                                </Link>
                            ):(
                                <p>{item.task}</p>
                            )}
                            <button className={styles.trash} onClick={ () => handleDeleteTask(item.id) }>
                                <FaTrash
                                    size={24}
                                    color="#ea3140"
                                />
                            </button>
                        </div>
                    </article>
                    ) )}

                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {

    const session = await getSession({req})

    //Verifica se possui usuário logado e redireciona pra home
    if (!session?.user) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            }
        }
    }

    return {
        props: {
            user: {
                email: session?.user?.email
            }
        },
    };
};