import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FloatingLabel, Form, Button, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      alert("Não foi possível carregar os agendamentos. Tente novamente mais tarde.");
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
      }

      const resultado = await resposta.json();
      console.log("Resposta do backend:", resultado);

      await loadData();
      reset();
    } catch (erro) {
      console.error("Erro ao salvar agendamento:", erro);
      alert("Não foi possível salvar o agendamento. Tente novamente.");
    }
  }

  async function excluirAgendamentos(id) {
    const confirmacao = window.confirm("Tem certeza de que deseja excluir o Agendamento?");

    if (!confirmacao) return;

    try {
      const resposta = await fetch(`http://localhost:3000/agendamentos/${id}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        throw new Error("Erro ao excluir o agendamento. Tente novamente mais tarde.");
      }

      alert("Agendamento excluído com sucesso!");
      loadData();
    } catch (erro) {
      console.error("Erro ao excluir agendamento:", erro);
      alert("Não foi possível excluir o agendamento. Verifique sua conexão ou tente mais tarde.");
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
    <div className="container mt-5">
      <h1 className="mb-4">Agendamentos</h1>
      <form onSubmit={handleSubmit(salvarAgendamentos)}>
        <FloatingLabel controlId="floatingCliente" label="Cliente" className="mb-3">
          <Form.Control
            type="text"
            placeholder="Digite o nome do cliente"
            {...register("cliente")}
          />
        </FloatingLabel>

        <FloatingLabel controlId="floatingDataAgendamento" label="Data do Agendamento" className="mb-3">
          <Form.Control
            type="date"
            placeholder="Selecione a data do agendamento"
            {...register("dataAgendamento")}
          />
        </FloatingLabel>

        <FloatingLabel controlId="floatingHoraAgendamento" label="Horários Disponíveis" className="mb-3">
          <Form.Select {...register("horaAgendamento")}> 
            {horariosDisponiveis.map((horario) => (
              <option key={horario} value={horario}>
                {horario}
              </option>
            ))}
          </Form.Select>
        </FloatingLabel>

        <Button variant="success" type="submit">
          Adicionar Agendamento
        </Button>
      </form>

      {agendamentos.length > 0 ? (
        <Table striped bordered hover className="mt-4">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Hora</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map((agendamento, index) => (
              <tr key={agendamento.id}>
                <td>{index + 1}</td>
                <td>{agendamento.cliente}</td>
                <td>{agendamento.dataAgendamento}</td>
                <td>{agendamento.horaAgendamento}</td>
                <td>
                  <Button variant="danger" onClick={() => excluirAgendamentos(agendamento.id)}>
                    Excluir
                  </Button>{" "}
                  <Button
                      variant="primary"
                      onClick={() => editarAgendamentos(agendamento.id)}
                    >
                      Editar
                    </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="mt-4">Não há agendamentos</p>
      )}
    </div>
  );
}

export default App;
