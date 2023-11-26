import { GetServerSideProps } from "next"
import Head from "next/head"
import styles from "./styles.module.css"
import TextArea from "@/components/textarea"

import { getSession } from "next-auth/react"

export default function Dashboard() {
    return (
        <div className={styles.container}>

            <Head>
                <title>Meu painel de tarefas</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.tile}>
                            Qual sua tarefa?
                        </h1>

                        <form>
                            <TextArea/>
                            <div className={styles.checkboxArea}>
                                <input type="checkbox" className={styles.checkbox}/>
                                <label>Deixar tarefa publica?</label>
                            </div>
                            <button type="submit" className={styles.button}>
                                Registrar
                            </button>
                        </form>
                    </div>
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
        props: {},
    };
};