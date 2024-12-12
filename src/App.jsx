import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function App() {
  const [agendamentos, setAgendamentos] = useState([]);
  const { handleSubmit, register, reset } = useForm();

  async function loadData() {
    try {
      const resposta = await fetch("http://localhost:3000/agendamentos");
      const dados = await resposta.json();
     setAgendamentos(dados);
    } catch (erro) {
      console.error("Erro ao carregar os agendamentos:", erro);
      alert(
        "Não foi possível carregar os agendamentos. Tente novamente mais tarde."
      );
    }
  }

  async function salvarAgendamentos(dados) {
    try {
      console.log("Dados enviados:", dados);

      const resposta = await fetch("http://localhost:3000/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      if (!resposta.ok) {
        throw new Error(`Erro ao salvar agendamento: ${resposta.statusText}`);
        console.log(dados);
      }

      const resultado = await resposta.json();
      console.log("Resposta do backend:", resultado);

      await loadData();
      reset();
    } catch (erro) {
      console.error("Erro ao salvar agendamento:", erro);
      alert("Não foi possível salvar o agendamento. Tente novamente.");
      console.log(dados);
    }
  }

  async function excluirAgendamentos(id) {
    const confirmacao = window.confirm(
      "Tem certeza de que deseja excluir o Agendamento?"
    );

    if (!confirmacao) return;

    try {
      const resposta = await fetch(`http://localhost:3000/agendamentos/${id}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        throw new Error(
          "Erro ao excluir o agendamento. Tente novamente mais tarde."
        );
      }

      alert("Agendamento excluído com sucesso!");
      loadData();
    } catch (erro) {
      console.error("Erro ao excluir agendamento:", erro);
      alert(
        "Não foi possível excluir o agendamento. Verifique sua conexão ou tente mais tarde."
      );
    }
  }

  async function editarAgendamentos(id) {
    const response = await fetch(`http://localhost:3000/agendamentos/${id}`);
    const agendamento = await response.json();

    const cliente = window.prompt(
      "Digite um novo Cliente:",
      agendamento.cliente
    );
    if (!cliente || cliente === agendamento.cliente) return;

    await fetch(`http://localhost:3000/agendamentos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cliente }),
    });
    loadData();
  }

  useEffect(() => {
    loadData();
  }, []);
  const horariosDisponiveis = Array.from({ length: 21 }, (_, index) => {
    const hour = Math.floor(index / 2) + 9;
    const minutes = index % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  }).filter((horario) => {
    return !agendamentos.some((agendamento) => agendamento.horarios === horario);
  });

  return (
    <div>
      <h1>Agendamentos</h1>

      <form onSubmit={handleSubmit(salvarAgendamentos)}>
        <div>
          <label htmlFor="cliente">Cliente</label>
          <input type="text" id="cliente" {...register("cliente")} />
        </div>
        <div>
          <label htmlFor="dataAgendamento">Data do Agendamento</label>
          <input
            type="date"
            id="dataAgendamento"
            {...register("dataAgendamento")}
          />
        </div>
        <div>
          <label htmlFor="horaAgendamento">Horários Disponíveis</label>
          <select id="horaAgendamento" {...register("horaAgendamento")}>
            {horariosDisponiveis.map((horario) => (
              <option key={horario} value={horario}>
                {horario}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Adicionar Agendamento</button>
      </form>

      {agendamentos ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Hora</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map((agendamento) => (
              <tr key={agendamento.id}>
                <td>{agendamento.id}</td>
                <td>{agendamento.cliente}</td>
                <td>{agendamento.dataAgendamento}</td>
                <td>{agendamento.horaAgendamento}</td>
                <td>
                  <button onClick={() => excluirAgendamentos(agendamento.id)}>
                    Excluir
                  </button>
                  <button onClick={() => editarAgendamentos(agendamento.id)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Não há agendamentos</p>
      )}
    </div>
  );
}

export default App;
